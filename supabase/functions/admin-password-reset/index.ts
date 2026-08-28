import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const memberEmails: Record<string, string> = {
  "서성준":"seongjun@jeja-travel.com", "최민규":"minkyu@jeja-travel.com", "한은혜":"eunhye@jeja-travel.com",
  "이다경":"dagyeong@jeja-travel.com", "김학진":"hakjin@jeja-travel.com", "은태경":"taegyeong@jeja-travel.com", "이은비":"eunbi@jeja-travel.com",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers:cors });
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) throw new Error("로그인이 필요합니다.");
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const caller = createClient(url, anonKey, { global:{ headers:{ Authorization:authorization } } });
    const { data:{ user } } = await caller.auth.getUser();
    if (!user) throw new Error("로그인이 만료되었습니다.");
    const admin = createClient(url, serviceKey);
    const { data:profile } = await admin.from("profiles").select("role").eq("id",user.id).single();
    if (profile?.role !== "admin") return Response.json({ error:"관리자만 변경할 수 있습니다." }, { status:403, headers:cors });
    const { member, password } = await request.json();
    if (!memberEmails[member] || typeof password !== "string" || password.length < 6) {
      return Response.json({ error:"멤버와 6자 이상의 비밀번호를 확인합니다." }, { status:400, headers:cors });
    }
    const { data:{ users }, error:listError } = await admin.auth.admin.listUsers({ page:1, perPage:100 });
    if (listError) throw listError;
    const target = users.find(item => item.email === memberEmails[member]);
    if (!target) return Response.json({ error:"아직 가입하지 않은 멤버입니다." }, { status:404, headers:cors });
    const { error:updateError } = await admin.auth.admin.updateUserById(target.id, { password });
    if (updateError) throw updateError;
    return Response.json({ ok:true }, { headers:cors });
  } catch (error) {
    return Response.json({ error:error instanceof Error ? error.message : "변경하지 못했습니다." }, { status:500, headers:cors });
  }
});
