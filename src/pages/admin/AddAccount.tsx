import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { heroesTemplate } from "@/utils/heroesData";

const formSchema = z.object({
  rank: z.string().min(1, "Rank is required"),
  price: z.string().min(1, "Price is required"),
  totalHeroes: z.string().min(1, "Total heroes is required"),
  winRate: z.string().min(1, "Win rate is required"),
  selectedHero: z.string().min(1, "Please select a hero"),
  selectedSkins: z.array(z.string()).min(1, "Please select at least one skin"),
});

const AddAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedHero, setSelectedHero] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: "",
      price: "",
      totalHeroes: "",
      winRate: "",
      selectedHero: "",
      selectedSkins: [],
    },
  });

  const currentHero = heroesTemplate.find(h => h.id === selectedHero);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    toast({
      title: "Account added successfully!",
      description: `Account with ${values.selectedSkins.length} skins has been added.`,
    });
    form.reset();
    setSelectedHero("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/admin")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="border-border bg-card max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>
              Manually input account data with heroes and skins
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="rank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rank</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Epic">Epic</SelectItem>
                            <SelectItem value="legend">Legend</SelectItem>
                            <SelectItem value="mythic">Mythic</SelectItem>
                            <SelectItem value="mythic-glory">Mythic Glory</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (Rp)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1000000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="totalHeroes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Heroes</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="winRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Win Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="65" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="selectedHero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Hero Template</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedHero(value);
                          form.setValue("selectedSkins", []);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a hero" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {heroesTemplate.map((hero) => (
                            <SelectItem key={hero.id} value={hero.id}>
                              {hero.name} ({hero.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose a hero to view available skins
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {currentHero && (
                  <>
                    <div className="bg-accent/50 border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Available Skins for {currentHero.name}</h3>
                        <span className="text-sm text-muted-foreground">{currentHero.skins.length} skins</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {currentHero.skins.map((skin) => (
                          <span 
                            key={skin}
                            className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-sm"
                          >
                            {skin}
                          </span>
                        ))}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="selectedSkins"
                      render={() => (
                        <FormItem>
                          <FormLabel>Select Skins for This Account</FormLabel>
                          <FormDescription>
                            Check the skins that this account owns
                          </FormDescription>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {currentHero.skins.map((skin) => (
                            <FormField
                              key={skin}
                              control={form.control}
                              name="selectedSkins"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={skin}
                                    className="flex items-center space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(skin)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, skin])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== skin
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      {skin}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-gradient-primary hover:shadow-glow-primary"
                  >
                    Add Account
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setSelectedHero("");
                    }}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddAccount;
