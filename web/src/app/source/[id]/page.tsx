import { readDesk } from "@/lib/articles";
import { notFound } from "next/navigation";

export default async function SourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await readDesk(`/source/${encodeURIComponent(id)}`);
  if (!post) notFound();
  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-sm text-gray-500">Sample Telegram message · #{post.message}</p>
      <h1 className="text-3xl font-bold my-4">{post.channel}</h1>
      <time className="text-sm text-gray-500">{new Date(post.stamp).toUTCString()}</time>
      <p className="mt-6 whitespace-pre-line leading-8">{post.text}</p>
    </article>
  );
}
