import { useState, useEffect } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hero {
  id: string;
  name: string;
  role: string;
  lanes: string[];
  skins: string[];
}

interface HeroRecord {
  data: {
    hero: {
      data: {
        name: string;
        sortid: Array<{
          data: {
            sort_title: string;
          };
        }>;
        roadsort: Array<{
          data: {
            road_sort_title: string;
          };
        }>;
      };
    };
    hero_id: number;
  };
}

interface ApiResponse {
  code: number;
  data: {
    records: HeroRecord[];
    total: number;
  };
  message?: string;
}

const formSchema = z.object({
  rank: z.string().min(1, "Rank is required"),
  price: z.string().min(1, "Price is required"),
  selectedHeroes: z.array(z.string()).min(1, "Please select at least one hero"),
  selectedSkins: z.record(z.string(), z.array(z.string())),
});

const AddAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [laneFilter, setLaneFilter] = useState<string>("");
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        const allHeroes: Hero[] = [];
        let index = 1;
        const size = 50; // Fetch 50 at a time
        let hasMore = true;

        // Build query parameters for API filtering
        let queryParams = `size=${size}&index=${index}`;
        if (roleFilter) {
          queryParams += `&role=${roleFilter.toLowerCase()}`;
        }
        if (laneFilter) {
          const laneMapping: { [key: string]: string } = {
            "Gold Lane": "gold",
            "Exp Lane": "exp",
            "Mid Lane": "mid",
            "Roam": "roam",
            "Jungle": "jungle"
          };
          const apiLane = laneMapping[laneFilter];
          if (apiLane) {
            queryParams += `&lane=${apiLane}`;
          }
        }

        while (hasMore) {
          const response = await fetch(`https://mlbb-stats.ridwaanhall.com/api/hero-list/?${queryParams.replace('index=1', `index=${index}`)}`);
          const result: ApiResponse = await response.json();
          if (result.code === 0 && result.data.records.length > 0) {
            const fetchedHeroes = result.data.records.map((record: HeroRecord) => {
              // Get primary role (first in sortid array)
              const primaryRole = record.data.hero.data.sortid?.[0]?.data?.sort_title || "Unknown";
              // Get all lanes for this hero
              const lanes = record.data.hero.data.roadsort?.map(r => r.data?.road_sort_title).filter(Boolean) || [];
              return {
                id: record.data.hero_id.toString(),
                name: record.data.hero.data.name,
                role: primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1), // Capitalize first letter
                lanes: lanes,
                skins: [] // Will be populated from detail API
              };
            });
            allHeroes.push(...fetchedHeroes);
            index++;
            hasMore = result.data.records.length === size; // Continue if we got a full page
          } else {
            hasMore = false;
          }
        }

        if (allHeroes.length > 0) {
          // Fetch detailed info for each hero to get skins
          const heroDetailsPromises = allHeroes.map(async (hero) => {
            try {
              const detailResponse = await fetch(`https://mlbb-stats.ridwaanhall.com/api/hero-detail/${hero.id}`);
              if (!detailResponse.ok) {
                console.warn(`Failed to fetch details for hero ${hero.id}: ${detailResponse.status}`);
                return hero; // Return hero with empty skins
              }
              const detailData = await detailResponse.json();
              if (detailData.code === 0 && detailData.data && detailData.data.skins) {
                return { ...hero, skins: detailData.data.skins };
              } else {
                console.warn(`Invalid detail response for hero ${hero.id}`);
                return hero;
              }
            } catch (error) {
              console.warn(`Error fetching details for hero ${hero.id}:`, error);
              return hero; // Return hero with empty skins
            }
          });

          const heroesWithDetails = await Promise.all(heroDetailsPromises);

          // Remove duplicates based on id
          const uniqueHeroes = heroesWithDetails.filter((hero, index, self) =>
            index === self.findIndex(h => h.id === hero.id)
          );
          setHeroes(uniqueHeroes);
        } else {
          // If no heroes found with current filters, fetch all heroes without filters
          if (roleFilter || laneFilter) {
            const fallbackHeroes: Hero[] = [];
            let fallbackIndex = 1;
            let fallbackHasMore = true;

            while (fallbackHasMore) {
              const fallbackResponse = await fetch(`https://mlbb-stats.ridwaanhall.com/api/hero-list/?size=${size}&index=${fallbackIndex}`);
              const fallbackResult: ApiResponse = await fallbackResponse.json();
              if (fallbackResult.code === 0 && fallbackResult.data.records.length > 0) {
                const fallbackFetchedHeroes = fallbackResult.data.records.map((record: HeroRecord) => {
                  const primaryRole = record.data.hero.data.sortid?.[0]?.data?.sort_title || "Unknown";
                  const lanes = record.data.hero.data.roadsort?.map(r => r.data?.road_sort_title).filter(Boolean) || [];
                  return {
                    id: record.data.hero_id.toString(),
                    name: record.data.hero.data.name,
                    role: primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1),
                    lanes: lanes,
                    skins: []
                  };
                });
                fallbackHeroes.push(...fallbackFetchedHeroes);
                fallbackIndex++;
                fallbackHasMore = fallbackResult.data.records.length === size;
              } else {
                fallbackHasMore = false;
              }
            }

            const uniqueFallbackHeroes = fallbackHeroes.filter((hero, index, self) =>
              index === self.findIndex(h => h.id === hero.id)
            );
            setHeroes(uniqueFallbackHeroes);
          } else {
            // Fallback to static data if API fails
            setHeroes([]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch heroes:', error);
        // Fallback to static data if API fails
        setHeroes([]);
        toast({
          title: "Error",
          description: "Failed to load heroes data from API. Using fallback data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, [roleFilter, laneFilter, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: "",
      price: "",
      selectedHeroes: [],
      selectedSkins: {},
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    const heroNames = selectedHeroes.map(id => heroes.find(h => h.id === id)?.name).join(", ");
    const skinList = Object.entries(values.selectedSkins).flatMap(([heroId, skins]) =>
      skins.map(skin => `${heroes.find(h => h.id === heroId)?.name} ${skin}`)
    ).join(", ");
    toast({
      title: "Account added successfully!",
      description: `Heroes: ${heroNames}\nSkins: ${skinList}`,
    });
    form.reset();
    setSelectedHeroes([]);
  };

  const handleHeroChange = (heroId: string, checked: boolean) => {
    let newSelectedHeroes;
    if (checked) {
      newSelectedHeroes = [...selectedHeroes, heroId];
    } else {
      newSelectedHeroes = selectedHeroes.filter(id => id !== heroId);
      // Remove skins for unselected hero
      const currentSkins = form.getValues("selectedSkins");
      delete currentSkins[heroId];
      form.setValue("selectedSkins", currentSkins);
    }
    setSelectedHeroes(newSelectedHeroes);
    form.setValue("selectedHeroes", newSelectedHeroes);
  };

  const handleSkinChange = (heroId: string, skin: string, checked: boolean) => {
    const currentSkins = form.getValues("selectedSkins");
    const heroSkins = currentSkins[heroId] || [];
    let newHeroSkins;
    if (checked) {
      newHeroSkins = [...heroSkins, skin];
    } else {
      newHeroSkins = heroSkins.filter(s => s !== skin);
    }
    form.setValue("selectedSkins", { ...currentSkins, [heroId]: newHeroSkins });
  };

  const filteredHeroes = heroes.filter(hero => {
    const roleMatch = !roleFilter || hero.role === roleFilter;
    const laneMatch = !laneFilter || hero.lanes.includes(laneFilter);
    return roleMatch && laneMatch;
  });

  const selectedHeroNames = selectedHeroes.map(id => heroes.find(h => h.id === id)?.name).join(", ");
  const selectedSkinList = Object.entries(form.watch("selectedSkins")).flatMap(([heroId, skins]) =>
    skins.map(skin => `${heroes.find(h => h.id === heroId)?.name} ${skin}`)
  ).join(", ");

  const roles = ["Tank", "Fighter", "Assassin", "Mage", "Marksman", "Support"];
  const lanes = ["Gold Lane", "Exp Lane", "Mid Lane", "Roam", "Jungle"];

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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading heroes...</span>
              </div>
            ) : (
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
                </div>

                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4 mb-4">
                  <div className="relative border border-gray-700 rounded-lg bg-charcoal/30">
                    <div className="px-3 py-2 border-b border-gray-700">
                      <h3 className="text-xs font-semibold text-teal-400">Filter by Role</h3>
                    </div>
                    <div className="p-2 overflow-x-auto">
                      <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
                        {roles.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setRoleFilter(roleFilter === role ? "" : role)}
                            className={`flex flex-col items-center gap-1.5 px-3 py-2 min-w-[60px] md:min-w-0 rounded-lg transition-all duration-200 ${
                              roleFilter === role ? "bg-primary text-primary-foreground" : "bg-gray-700 hover:bg-gray-600"
                            } active:scale-95`}
                            aria-label={`Filter by ${role}`}
                          >
                            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                              {role.charAt(0)}
                            </div>
                            <span className="text-[10px] font-medium leading-tight text-center">{role}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative border border-gray-700 rounded-lg bg-charcoal/30">
                    <div className="px-3 py-2 border-b border-gray-700">
                      <h3 className="text-xs font-semibold text-teal-400">Filter by Lane</h3>
                    </div>
                    <div className="p-2 overflow-x-auto">
                      <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap">
                        {lanes.map((lane) => (
                          <button
                            key={lane}
                            type="button"
                            onClick={() => setLaneFilter(laneFilter === lane ? "" : lane)}
                            className={`flex flex-col items-center gap-1.5 px-3 py-2 min-w-[60px] md:min-w-0 rounded-lg transition-all duration-200 ${
                              laneFilter === lane ? "bg-primary text-primary-foreground" : "bg-gray-700 hover:bg-gray-600"
                            } active:scale-95`}
                            aria-label={`Filter by ${lane}`}
                          >
                            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-xs font-bold">
                              {lane.split(" ")[0].charAt(0)}
                            </div>
                            <span className="text-[10px] font-medium leading-tight text-center">{lane}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="selectedHeroes"
                  render={() => (
                    <FormItem>
                      <FormLabel>Select Heroes</FormLabel>
                      <FormDescription>
                        Check the heroes that this account owns
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                        {filteredHeroes.map((hero) => (
                          <FormItem
                            key={hero.id}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={selectedHeroes.includes(hero.id)}
                                onCheckedChange={(checked) => handleHeroChange(hero.id, checked as boolean)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {hero.name} ({hero.role})
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedHeroes.map((heroId) => {
                  const hero = heroes.find(h => h.id === heroId);
                  if (!hero) return null;
                  return (
                    <div key={heroId} className="bg-accent/50 border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">Available Skins for {hero.name}</h3>
                        <span className="text-sm text-muted-foreground">{hero.skins.length} skins</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {hero.skins.map((skin) => (
                          <FormItem
                            key={skin}
                            className="flex items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={form.watch("selectedSkins")[heroId]?.includes(skin) || false}
                                onCheckedChange={(checked) => handleSkinChange(heroId, skin, checked as boolean)}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {skin}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {(selectedHeroNames || selectedSkinList) && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-foreground mb-2">Account Summary</h3>
                    {selectedHeroNames && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Heroes:</strong> {selectedHeroNames}
                      </p>
                    )}
                    {selectedSkinList && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Skins:</strong> {selectedSkinList}
                      </p>
                    )}
                  </div>
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
                      setSelectedHeroes([]);
                    }}
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddAccount;
