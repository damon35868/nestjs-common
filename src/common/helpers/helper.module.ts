import { Global, Module } from "@nestjs/common";
import { CacheHelper } from "./cache.helper";
import { PageHelper } from "./page.helper";

@Global()
@Module({
  providers: [CacheHelper, PageHelper],
  exports: [CacheHelper, PageHelper]
})
export class HelperModule {}
