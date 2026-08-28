import type { User } from "@supabase/supabase-js";
import { adminClient } from "@/lib/supabase/admin";
export async function ensureUserOrganization(user: User) {
  const admin=adminClient();
  const {data:membership,error}=await admin.from("organization_members").select("organization_id,role,organizations(id,name,slug,plan)").eq("user_id",user.id).limit(1).maybeSingle();
  if(error)throw error;if(membership)return membership;
  const emailName=user.email?.split("@")[0]?.replace(/[^a-zA-Z0-9 ]/g," ").trim();const name=emailName?`${emailName}'s workspace`:"My workspace";const slug=`workspace-${user.id.slice(0,8)}-${crypto.randomUUID().slice(0,6)}`;
  const {data:organization,error:organizationError}=await admin.from("organizations").insert({name,slug}).select("id,name,slug,plan").single();if(organizationError)throw organizationError;
  const {error:memberError}=await admin.from("organization_members").insert({organization_id:organization.id,user_id:user.id,role:"OWNER"});if(memberError){await admin.from("organizations").delete().eq("id",organization.id);throw memberError}
  return {organization_id:organization.id,role:"OWNER",organizations:organization};
}
