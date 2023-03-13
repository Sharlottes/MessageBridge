import Platform from "./platform/Platform";

class Vars {
  public platforms: Set<Platform> = new Set();
  public mappedPlatforms: Map<string, Platform> = new Map();

  public addPlatform(platform: Platform) {
    if (this.mappedPlatforms.has(platform.getId())) return;

    this.platforms.add(platform);
    this.mappedPlatforms.set(platform.getId(), platform);
  }
}

export default new Vars();
