import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import Section from "@/components/section";
import LocationSelector from "@/components/location-selector";
import SearchPanel from "@/components/search-panel";
import { BazarCard, ProductCard, SellerCard } from "@/components/market-cards";
import Hero from "@/components/hero";

export default function Home() {
  return (
    <div>
      <SiteHeader />
      <main>
        <Hero />
        <Section
          title="Set your local market"
          subtitle="Pick division, district, and area to unlock nearby sellers and live inventory."
        >
          <LocationSelector />
        </Section>
        <Section
          title="Search across bazaars"
          subtitle="Find sellers, items, and offers with flexible filters."
        >
          <SearchPanel />
        </Section>
        <Section
          title="Featured bazaars"
          subtitle="Handpicked local bazaars near you."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <BazarCard
              title="Karwan Bazar"
              subtitle="Dhaka Central"
              meta="130 sellers"
            />
            <BazarCard
              title="New Market"
              subtitle="Dhanmondi"
              meta="90 sellers"
            />
            <BazarCard
              title="Khatunganj"
              subtitle="Chattogram"
              meta="220 sellers"
            />
          </div>
        </Section>
        <Section
          title="Top sellers"
          subtitle="Verified shops with stellar ratings."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <SellerCard
              title="FreshFish by Rahman"
              subtitle="Hilsa, rui, koi"
              meta="4.9 rating"
            />
            <SellerCard
              title="GreenHarvest"
              subtitle="Vegetables and fruits"
              meta="4.8 rating"
            />
            <SellerCard
              title="SpiceHouse"
              subtitle="Dry spices"
              meta="4.7 rating"
            />
          </div>
        </Section>
        <Section
          title="Recent products"
          subtitle="Just posted from nearby sellers."
        >
          <div className="grid gap-6 md:grid-cols-3">
            <ProductCard
              title="Hilsa 1.2kg"
              subtitle="Fresh from Chandpur"
              meta="BDT 1200"
            />
            <ProductCard
              title="Deshi Tomato"
              subtitle="Garden fresh"
              meta="BDT 80/kg"
            />
            <ProductCard
              title="Organic Honey"
              subtitle="Sylhet hills"
              meta="BDT 950"
            />
          </div>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
