import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Hero {
  id: string;
  name: string;
  role: string; // role utama untuk display
  allRoles: string[]; // semua role yang dimiliki hero
  lanes: string[]; // semua lane hero
  skins: string[]; // akan diisi lazy
  image: string; // URL gambar hero
}

interface HeroPositionRecord {
  data: {
    hero: {
      data: {
        name: string;
        head: string;
        smallmap: string;
        sortid: Array<
          | {
              data?: {
                sort_title?: string;
              };
            }
          | string
        >;
        roadsort: Array<
          | {
              data?: {
                road_sort_title?: string;
              };
            }
          | string
        >;
      };
    };
    hero_id: number;
  };
}

interface HeroPositionResponse {
  code: number;
  data: {
    records: HeroPositionRecord[];
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

  // state pilihan user
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [laneFilter, setLaneFilter] = useState<string>("");

  // hero data
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHeroSkin, setLoadingHeroSkin] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rank: "",
      price: "",
      selectedHeroes: [],
      selectedSkins: {},
    },
  });

  // helper buat normalisasi string jadi kapital di depan
  const normalizeLabel = (label: string | undefined): string => {
    if (!label || typeof label !== "string") return "Unknown";
    if (label.length === 0) return "Unknown";
    return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
  };

  // fetch hero list dari hero-position
  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        setLoading(true);

        // catatan: pakai proxy dev seperti /mlapi/... kalau tidak proxy, ganti ke full url dan siap hadapi CORS
        const res = await fetch(
          "/mlapi/api/hero-position/?format=json&page=1&size=200"
        );

        if (!res.ok) {
          throw new Error("Failed to fetch hero-position");
        }

        const json: HeroPositionResponse = await res.json();

        if (json.code !== 0 || !json.data || !json.data.records) {
          throw new Error("Invalid hero-position response");
        }

        const mappedHeroes: Hero[] = json.data.records.map((record) => {
          const rawHero = record?.data?.hero?.data;
          const heroId = record?.data?.hero_id;

          const name = rawHero?.name ?? "Unknown Hero";

          // ambil semua role dari sortid
          const allRolesRaw = (rawHero?.sortid || [])
            .filter((item) => typeof item === "object" && item !== null)
            .map((item) => {
              const obj = item as { data?: { sort_title?: string } };
              return normalizeLabel(obj?.data?.sort_title);
            })
            .filter(Boolean);

          const mainRole = allRolesRaw[0] || "Unknown";

          // ambil semua lane dari roadsort
          const allLanesRaw = (rawHero?.roadsort || [])
            .filter((item) => typeof item === "object" && item !== null)
            .map((item) => {
              const obj = item as { data?: { road_sort_title?: string } };
              return normalizeLabel(obj?.data?.road_sort_title);
            })
            .filter(Boolean);

          return {
            id: heroId != null ? heroId.toString() : crypto.randomUUID(),
            name: name,
            role: mainRole,
            allRoles: Array.from(new Set(allRolesRaw)),
            lanes: Array.from(new Set(allLanesRaw)),
            skins: [],
            image:
              rawHero?.smallmap ??
              `https://akmweb.youngjoygame.com/web/svnres/img/mlbb/homepage/100_${heroId}_c7e0183956b2c2fd6d3fa0b18fe46917.png`,
          };
        });

        const uniqueHeroes = mappedHeroes.filter(
          (hero, idx, self) => idx === self.findIndex((h) => h.id === hero.id)
        );

        setHeroes(uniqueHeroes);
      } catch (err) {
        console.error(err);
        setHeroes([]);
        toast({
          title: "Error",
          description:
            "Failed to load heroes from API. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, [toast]);

  // ambil skins hero tertentu saat dibutuhkan
  const fetchHeroDetail = useCallback(async (heroId: string) => {
    try {
      setLoadingHeroSkin(heroId);

      const res = await fetch(`/mlapi/api/hero-detail/${heroId}`);

      if (!res.ok) {
        console.warn(
          `Failed to fetch hero-detail for hero ${heroId}: ${res.status}`
        );
        return;
      }

      const detailJson = await res.json();

      if (
        detailJson.code === 0 &&
        detailJson.data &&
        Array.isArray(detailJson.data.skins)
      ) {
        const skinsFromApi: string[] = detailJson.data.skins;

        setHeroes((prev) =>
          prev.map((h) =>
            h.id === heroId
              ? {
                  ...h,
                  skins: skinsFromApi,
                }
              : h
          )
        );
      } else {
        console.warn(`Invalid hero-detail response for hero ${heroId}`);
      }
    } catch (err) {
      console.warn(`Error fetching hero-detail for hero ${heroId}:`, err);
    } finally {
      setLoadingHeroSkin(null);
    }
  }, []);

  // ketika user centang hero
  const handleHeroChange = async (heroId: string, checked: boolean) => {
    let newSelectedHeroes: string[];

    if (checked) {
      newSelectedHeroes = [...selectedHeroes, heroId];

      const heroObj = heroes.find((h) => h.id === heroId);
      if (heroObj && heroObj.skins.length === 0) {
        fetchHeroDetail(heroId);
      }
    } else {
      newSelectedHeroes = selectedHeroes.filter((id) => id !== heroId);

      const currentSkins = form.getValues("selectedSkins");
      if (currentSkins[heroId]) {
        delete currentSkins[heroId];
        form.setValue("selectedSkins", { ...currentSkins });
      }
    }

    setSelectedHeroes(newSelectedHeroes);
    form.setValue("selectedHeroes", newSelectedHeroes);
  };

  // ketika user centang skin tertentu
  const handleSkinChange = (heroId: string, skin: string, checked: unknown) => {
    const currentSkins = form.getValues("selectedSkins");
    const heroSkins = currentSkins[heroId] || [];

    let newHeroSkins: string[];
    if (checked === true) {
      newHeroSkins = [...heroSkins, skin];
    } else {
      newHeroSkins = heroSkins.filter((s: string) => s !== skin);
    }

    form.setValue("selectedSkins", {
      ...currentSkins,
      [heroId]: newHeroSkins,
    });
  };

  // submit
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const payload = {
      rank: values.rank,
      price: Number(values.price),
      heroes: selectedHeroes.map((id) => {
        const heroObj = heroes.find((h) => h.id === id);
        return {
          id,
          name: heroObj?.name ?? "Unknown",
          skins: values.selectedSkins[id] ?? [],
        };
      }),
    };

    console.log("Final payload:", payload);

    const heroNames = payload.heroes
      .map((h) => h.name)
      .filter(Boolean)
      .join(", ");

    const skinList = payload.heroes
      .flatMap((h) => h.skins.map((skin) => `${h.name} ${skin}`))
      .join(", ");

    toast({
      title: "Account added successfully!",
      description: `Heroes: ${heroNames}\nSkins: ${skinList}`,
    });

    form.reset();
    setSelectedHeroes([]);
    setRoleFilter("");
    setLaneFilter("");
  };

  // filter hero sesuai tombol roleFilter dan laneFilter kamu
  const filteredHeroes = useMemo(() => {
    return heroes.filter((hero) => {
      const roleMatch =
        !roleFilter ||
        hero.allRoles.some((r) => r.toLowerCase() === roleFilter.toLowerCase());

      const laneMatch =
        !laneFilter ||
        hero.lanes.some((ln) => ln.toLowerCase() === laneFilter.toLowerCase());

      return roleMatch && laneMatch;
    });
  }, [heroes, roleFilter, laneFilter]);

  // summary untuk panel bawah
  const selectedHeroNames = selectedHeroes
    .map((id) => heroes.find((h) => h.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const selectedSkinList = Object.entries(form.watch("selectedSkins"))
    .flatMap(([heroId, skins]) =>
      skins.map(
        (skin) => `${heroes.find((h) => h.id === heroId)?.name} ${skin}`
      )
    )
    .join(", ");

  // ini yang kamu mau "tetep sama"
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

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Main Card - Left Side */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
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
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* rank dan price */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="rank"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rank</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rank" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Epic">Epic</SelectItem>
                                  <SelectItem value="Legend">Legend</SelectItem>
                                  <SelectItem value="Mythic">Mythic</SelectItem>
                                  <SelectItem value="Mythic Glory">
                                    Mythic Glory
                                  </SelectItem>
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
                                <Input
                                  type="number"
                                  placeholder="1000000"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Filter Role dan Lane, layout tetap sama */}
                      <div className="flex flex-col lg:flex-row gap-4 mb-4 justify-center">
                        {/* Filter by Role */}
                        <div className="relative border border-gray-700 rounded-lg bg-charcoal/30 flex-1">
                          <div className="px-3 py-2 border-b border-gray-700">
                            <h3 className="text-xs font-semibold text-teal-400">
                              Filter by Role
                            </h3>
                          </div>
                          <div className="p-2 overflow-x-auto">
                            <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap justify-center">
                              {roles.map((role) => (
                                <button
                                  key={role}
                                  type="button"
                                  onClick={() =>
                                    setRoleFilter(
                                      roleFilter === role ? "" : role
                                    )
                                  }
                                  className={`flex flex-col items-center gap-1.5 px-3 py-2 w-20 rounded-lg transition-all duration-200 ${
                                    roleFilter === role
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-gray-700 hover:bg-gray-600"
                                  } active:scale-95`}
                                  aria-label={`Filter by ${role}`}
                                >
                                  <img
                                    alt={role}
                                    loading="lazy"
                                    width="24"
                                    height="24"
                                    decoding="async"
                                    className="w-6 h-6 rounded-full mx-auto"
                                    src={`/src/components/icon/${role}_Icon.webp`}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <span className="text-[10px] font-medium leading-tight text-center">
                                    {role}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Filter by Lane */}
                        <div className="relative border border-gray-700 rounded-lg bg-charcoal/30 flex-1">
                          <div className="px-3 py-2 border-b border-gray-700">
                            <h3 className="text-xs font-semibold text-teal-400">
                              Filter by Lane
                            </h3>
                          </div>
                          <div className="p-2 overflow-x-auto">
                            <div className="flex gap-2 min-w-max md:min-w-0 md:flex-wrap justify-center">
                              {lanes.map((lane) => (
                                <button
                                  key={lane}
                                  type="button"
                                  onClick={() =>
                                    setLaneFilter(
                                      laneFilter === lane ? "" : lane
                                    )
                                  }
                                  className={`flex flex-col items-center gap-1.5 px-3 py-2 w-20 rounded-lg transition-all duration-200 ${
                                    laneFilter === lane
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-gray-700 hover:bg-gray-600"
                                  } active:scale-95`}
                                  aria-label={`Filter by ${lane}`}
                                >
                                  <img
                                    alt={lane}
                                    loading="lazy"
                                    width="24"
                                    height="24"
                                    decoding="async"
                                    className="w-6 h-6 rounded-full mx-auto"
                                    src={`/src/components/icon/${lane}.webp`}
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <span className="text-[10px] font-medium leading-tight text-center">
                                    {lane}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* daftar hero hasil filter */}
                      <FormField
                        control={form.control}
                        name="selectedHeroes"
                        render={() => (
                          <FormItem>
                            <FormLabel>Select Heroes</FormLabel>
                            <FormDescription>
                              Check the heroes that this account owns
                            </FormDescription>

                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-3">
                              {filteredHeroes.map((hero) => (
                                <HoverCard key={hero.id}>
                                  <HoverCardTrigger asChild>
                                    <div
                                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                                        selectedHeroes.includes(hero.id)
                                          ? "border-primary bg-primary/10 shadow-lg"
                                          : "border-border hover:border-primary/50"
                                      }`}
                                      onClick={() =>
                                        handleHeroChange(
                                          hero.id,
                                          !selectedHeroes.includes(hero.id)
                                        )
                                      }
                                    >
                                      <div className="aspect-square overflow-hidden rounded-t-lg">
                                        <img
                                          src={hero.image}
                                          alt={hero.name}
                                          className="w-full h-full object-cover object-top"
                                          onError={(e) => {
                                            e.currentTarget.src =
                                              "/placeholder-hero.png";
                                          }}
                                        />
                                      </div>
                                      <div className="p-2 text-center">
                                        <h4 className="text-sm font-semibold truncate">
                                          {hero.name}
                                        </h4>
                                        <div className="flex items-center justify-center gap-1 mt-1">
                                          <img
                                            src={`/images/roles/${hero.role}_Icon.png`}
                                            alt={hero.role}
                                            className="w-4 h-4"
                                            onError={(e) => {
                                              e.currentTarget.style.display =
                                                "none";
                                            }}
                                          />
                                          <span className="text-xs text-muted-foreground">
                                            {hero.role}
                                          </span>
                                        </div>
                                      </div>
                                      {selectedHeroes.includes(hero.id) && (
                                        <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                          <svg
                                            className="w-3 h-3 text-primary-foreground"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-64">
                                    <div className="space-y-2">
                                      <h4 className="font-semibold">
                                        {hero.name}
                                      </h4>
                                      <div>
                                        <p className="text-sm font-medium">
                                          Roles:
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {hero.allRoles.join(", ")}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium">
                                          Lanes:
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          {hero.lanes.join(", ")}
                                        </p>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              ))}
                            </div>

                            <FormMessage />
                          </FormItem>
                        )}
                      />



                      {/* tombol submit dan reset */}
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
                            setRoleFilter("");
                            setLaneFilter("");
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

          {/* Right Side - Summary Panels */}
          <div className="lg:col-span-1 space-y-6">
            {/* Available Skins Panel */}
            {selectedHeroes.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Available Skins
                  </CardTitle>
                  <CardDescription>
                    Skins for selected heroes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedHeroes.map((heroId) => {
                    const hero = heroes.find((h) => h.id === heroId);
                    if (!hero) return null;

                    return (
                      <div key={heroId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">
                            {hero.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {hero.skins.length} skins
                          </span>
                        </div>

                        {hero.skins.length === 0 &&
                        loadingHeroSkin !== heroId ? (
                          <button
                            type="button"
                            className="text-xs underline text-primary hover:opacity-80"
                            onClick={() => fetchHeroDetail(heroId)}
                          >
                            Load skins
                          </button>
                        ) : (
                          <div className="grid grid-cols-1 gap-1">
                            {hero.skins.map((skin) => (
                              <FormItem
                                key={skin}
                                className="flex items-center space-x-2 space-y-0"
                              >
                                <FormControl>
                                  <div>Checkbox</div>
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer text-xs">
                                  {skin}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                        )}

                        {loadingHeroSkin === heroId && (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span className="text-xs text-muted-foreground">
                              Loading...
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Account Summary Panel */}
            {(selectedHeroNames || selectedSkinList) && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Account Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of selected items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedHeroNames && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Heroes ({selectedHeroes.length})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedHeroNames}
                      </p>
                    </div>
                  )}

                  {selectedSkinList && (
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Skins
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedSkinList}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddAccount;
