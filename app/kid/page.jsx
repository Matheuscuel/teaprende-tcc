"use client";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export default function KidHome({ searchParams }) {
  const childId = Number(searchParams?.childId ?? 1);
  return (
    <div className="p-8 grid gap-6">
      <h1 className="text-2xl font-bold text-center">Hora do Jogo!</h1>
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 grid gap-4">
          <Link href={`/games/memory?childId=${childId}`}><Button className="w-full h-16 text-xl">Jogo da Memória</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}
