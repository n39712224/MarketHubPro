import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "./ImageUpload";
import { insertListingSchema } from "@shared/schema";
import type { InsertListing } from "@shared/schema";
import { Sparkles, Wand2, Lightbulb, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const form = useForm<InsertListing>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      condition: "good",
      visibility: "public",
      images: [],
      status: "active",
      shippingOffered: false,
      localPickup: false,
    },
  });

  // AI assistance functions
  const generateDescription = async () => {
    const title = form.getValues("title");
    const category = form.getValues("category");
    const condition = form.getValues("condition");
    const price = form.getValues("price");

    if (!title || !category || !condition || price === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in title, category, condition, and price first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await apiRequest("POST", "/api/ai/generate-description", {
        title,
        category,
        condition,
        price,
      });
      const result = await response.json();
      
      form.setValue("description", result.description);
      setShowAISuggestions(true);
      
      toast({
        title: "AI Description Generated!",
        description: "Your listing description has been created using AI",
      });
    } catch (error) {
      toast({
        title: "AI Generation Failed",
        description: "Unable to generate description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const improveDescription = async () => {
    const description = form.getValues("description");
    if (!description) {
      toast({
        title: "No Description",
        description: "Please enter a description first",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingAI(true);
    try {
      const response = await apiRequest("POST", "/api/ai/improve-description", {
        description,
        context: {
          title: form.getValues("title"),
          category: form.getValues("category"),
          condition: form.getValues("condition"),
          price: form.getValues("price"),
        },
      });
      const result = await response.json();
      
      form.setValue("description", result.description);
      
      toast({
        title: "Description Improved!",
        description: "Your description has been enhanced with AI",
      });
    } catch (error) {
      toast({
        title: "AI Improvement Failed",
        description: "Unable to improve description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const createListingMutation = useMutation({
    mutationFn: async (data: InsertListing & { imageFiles: File[] }) => {
      const formData = new FormData();
      
      // Append text fields
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'imageFiles') {
          formData.append(key, value.toString());
        }
      });
      
      // Append image files
      data.imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({ title: "Listing created successfully!" });
      form.reset();
      setUploadedImages([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertListing) => {
    createListingMutation.mutate({
      ...data,
      imageFiles: uploadedImages,
    });
  };

  const handleClose = () => {
    if (!createListingMutation.isPending) {
      form.reset();
      setUploadedImages([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Listing</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Product Images
              </Label>
              <ImageUpload
                images={uploadedImages}
                onImagesChange={setUploadedImages}
                maxImages={5}
              />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="sports">Sports & Outdoors</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDescription}
                        disabled={isGeneratingAI}
                        className="h-8 px-3 text-xs bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40"
                      >
                        {isGeneratingAI ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1" />
                        )}
                        Generate with AI
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={improveDescription}
                        disabled={isGeneratingAI || !field.value}
                        className="h-8 px-3 text-xs bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                      >
                        {isGeneratingAI ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Wand2 className="h-3 w-3 mr-1" />
                        )}
                        Improve
                      </Button>
                    </div>
                  </div>
                  <FormControl>
                    <Textarea 
                      rows={6}
                      placeholder="Describe your item in detail... or use AI to generate a description!"
                      {...field}
                      className="resize-none"
                    />
                  </FormControl>
                  {showAISuggestions && field.value && (
                    <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300 mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <span className="font-medium">AI-Generated Description</span>
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        Your description has been optimized for better visibility and sales appeal. You can edit it further or use the "Improve" button to enhance it more.
                      </p>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Visibility Settings */}
            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="public" id="public" />
                        <div>
                          <Label htmlFor="public" className="text-sm font-medium">Public</Label>
                          <p className="text-xs text-gray-500">Anyone can see this listing</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="shared" id="shared" />
                        <div>
                          <Label htmlFor="shared" className="text-sm font-medium">Shared</Label>
                          <p className="text-xs text-gray-500">Only people with the link can see</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="private" id="private" />
                        <div>
                          <Label htmlFor="private" className="text-sm font-medium">Private</Label>
                          <p className="text-xs text-gray-500">Only you can see this listing</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shipping Options */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Shipping Options
              </Label>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="shippingOffered"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Offer shipping
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="localPickup"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Local pickup available
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleClose}
                disabled={createListingMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createListingMutation.isPending}
              >
                {createListingMutation.isPending ? "Creating..." : "Create Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
