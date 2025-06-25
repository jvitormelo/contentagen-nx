/* import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui/components/card";
import { useAppForm } from "@packages/ui/components/form";
import { Input } from "@packages/ui/components/input";
import { Label } from "@packages/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Sparkles } from "lucide-react";
import type { z } from "zod";

export function CreateContentForm() {
    const form = useAppForm({
        defaultValues: {
          name: '',
          targetAudience: '',
          tone: '',
          wordCount: 0,
          seoFocus: false,
          basePrompt: '',
          exampleArticle: '',
        },
       
        onSubmit: async ({ value }) => {
          // Do something with form data
          console.log(value)
        },
      })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted");
    }
  return (
    <Card>
    <CardHeader>
      <CardTitle className="flex items-center">
        <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
        Agent Configuration
      </CardTitle>
      <CardDescription>
        Set up your AI agent with specific instructions and examples to generate content that matches your style
        and requirements.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

          <div>
            <Label htmlFor="name">Agent Name</Label>
            <Input
              id="name"
              placeholder="e.g., Tech Blog Agent, Marketing Content Agent"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g., Software developers, Marketing professionals"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            />
          </div>
        </div>

        
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Content Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tone">Writing Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="wordCount">Target Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                min="500"
                max="5000"
                value={formData.wordCount}
                onChange={(e) => setFormData({ ...formData, wordCount: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="seoFocus"
              checked={formData.seoFocus}
              onCheckedChange={(checked) => setFormData({ ...formData, seoFocus: checked })}
            />
            <Label htmlFor="seoFocus">Enable SEO optimization</Label>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Base Prompt</h3>
          <div>
            <Label htmlFor="basePrompt">Instructions for your AI agent</Label>
            <Textarea
              id="basePrompt"
              placeholder="You are an expert content writer specializing in technology blogs. Write engaging, informative articles that explain complex concepts in simple terms. Always include practical examples and actionable insights..."
              rows={6}
              value={formData.basePrompt}
              onChange={(e) => setFormData({ ...formData, basePrompt: e.target.value })}
              required
            />
            <p className="text-sm text-gray-600 mt-2">
              Provide clear instructions about writing style, structure, and specific requirements.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Example Article</h3>
          <div>
            <Label htmlFor="exampleArticle">Paste an example article that represents your desired style</Label>
            <Textarea
              id="exampleArticle"
              placeholder="Paste a complete article that demonstrates the style, structure, and quality you want your agent to emulate..."
              rows={10}
              value={formData.exampleArticle}
              onChange={(e) => setFormData({ ...formData, exampleArticle: e.target.value })}
              required
            />
            <p className="text-sm text-gray-600 mt-2">
              This example will help the AI understand your preferred writing style and structure.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit">
            <Bot className="h-4 w-4 mr-2" />
            Create Agent
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
  )
} */
