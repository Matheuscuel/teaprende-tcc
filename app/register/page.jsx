"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export default function Register() {
  const [userType, setUserType] = useState("responsavel")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real application, this would handle the registration process
    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Você receberá um email para confirmar seu cadastro.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cadastro</CardTitle>
          <CardDescription>Crie sua conta para acessar a plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input id="name" placeholder="Digite seu nome completo" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Digite seu email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="Crie uma senha" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirme sua senha" required />
            </div>

            <div className="space-y-2">
              <Label>Tipo de usuário</Label>
              <RadioGroup defaultValue="responsavel" onValueChange={setUserType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="responsavel" id="responsavel" />
                  <Label htmlFor="responsavel">Responsável</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professor" id="professor" />
                  <Label htmlFor="professor">Professor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="terapeuta" id="terapeuta" />
                  <Label htmlFor="terapeuta">Terapeuta</Label>
                </div>
              </RadioGroup>
            </div>

            {userType === "professor" && (
              <div className="space-y-2">
                <Label htmlFor="institution">Instituição de ensino</Label>
                <Input id="institution" placeholder="Digite o nome da instituição" />
              </div>
            )}

            {userType === "terapeuta" && (
              <div className="space-y-2">
                <Label htmlFor="specialization">Especialização</Label>
                <Input id="specialization" placeholder="Digite sua especialização" />
              </div>
            )}

            <Button type="submit" className="w-full">
              Cadastrar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
