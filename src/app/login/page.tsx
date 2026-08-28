import Link from "next/link";import { AuthForm } from "@/components/auth-form";
export default function Login(){return <main className="authPage"><Link className="brand" href="/"><span>R</span> RichSentry</Link><section><small>WELCOME BACK</small><h1>Sign in to your workspace</h1><p>Keep a quiet, continuous watch over every service you ship.</p><AuthForm mode="login"/></section></main>}
