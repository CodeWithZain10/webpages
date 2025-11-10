import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ArticlePayload {
  title: string;
  subtitle: string;
  content: Array<{
    type: 'paragraph' | 'bullet' | 'numbered' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    text: string;
  }>;
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method === "POST") {
      const payload: ArticlePayload = await req.json();

      if (!payload.title || !payload.subtitle || !payload.content) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: title, subtitle, content" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );

      const { data, error } = await supabase
        .from("articles")
        .insert([
          {
            title: payload.title,
            subtitle: payload.subtitle,
            content: payload.content,
          },
        ])
        .select()
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Article received and stored",
          id: data?.id,
        }),
        {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "GET") {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_ANON_KEY") || ""
      );

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify(data),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
