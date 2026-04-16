import marketplace from "../.claude-plugin/marketplace.json" with { type: "json" };

interface MarketplacePlugin {
  name: string;
  source: string;
  version: string;
  license: string;
  category: string;
  strict: boolean;
  keywords: readonly string[];
}

interface MarketplaceConfig {
  $schema: string;
  name: string;
  owner: {
    name: string;
    email: string;
  };
  plugins: readonly MarketplacePlugin[];
}

const typedMarketplaceConfig: MarketplaceConfig = marketplace;

export default typedMarketplaceConfig;
