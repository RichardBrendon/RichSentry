import { assertSafeUrl } from "./ssrf";
import type { MonitorInput } from "@/lib/schemas/monitor";
type CheckResult={status:"UP"|"DEGRADED"|"DOWN";httpStatus:number|null;responseTimeMs:number;error:string|null};
export async function performCheck(input:MonitorInput):Promise<CheckResult>{
  let current=await assertSafeUrl(input.url);const started=performance.now();const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),input.timeoutMs);
  try{for(let redirects=0;redirects<=3;redirects++){const response=await fetch(current,{method:input.method,headers:input.headers,redirect:"manual",signal:controller.signal,cache:"no-store"});if(response.status>=300&&response.status<400){const location=response.headers.get("location");if(!location||redirects===3)throw new Error("REDIRECT_LIMIT");current=await assertSafeUrl(new URL(location,current).toString());continue}const responseTimeMs=Math.round(performance.now()-started);const status:CheckResult["status"]=response.status!==input.expectedStatus?"DOWN":responseTimeMs>input.responseThresholdMs?"DEGRADED":"UP";return{status,httpStatus:response.status,responseTimeMs,error:null}}throw new Error("REDIRECT_LIMIT")}catch(error){return{status:"DOWN",httpStatus:null,responseTimeMs:Math.round(performance.now()-started),error:error instanceof Error?error.name:"CHECK_FAILED"}}finally{clearTimeout(timer)}
}
