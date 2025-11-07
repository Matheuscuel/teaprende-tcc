"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BackButton from "@/app/components/BackButton";
import { RoleGuard } from "@/app/components/auth/RoleGuard";
import { ROLES } from "@/app/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001/api";

export default function EditChildPage() {
  const router = useRouter();
  const params = useParams();
  const childId = params.id;
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    notes: "",
    preferences: "",
    supportLevel: "Baixo"
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadChildData();
  }, [childId]);

  const loadChildData = async () => {
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const response = await fetch(`${API_BASE}/children/${childId}`, {
        headers
      });

      if (!response.ok) {
        throw new Error("Erro ao carregar dados da criança");
      }

      const data = await response.json();
      const child = data.child || data;
      
      setFormData({
        name: child.name || "",
        age: child.age ? String(child.age) : "",
        gender: child.gender || "",
        notes: child.notes || "",
        preferences: child.preferences || "",
        supportLevel: child.support_level || "Baixo"
      });
    } catch (err) {
      setError(err.message || "Erro ao carregar dados da criança");
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      
      if (token === "demo-token") {
        headers["X-Demo-User"] = JSON.stringify(user);
      }
      
      const response = await fetch(`${API_BASE}/children/${childId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          gender: formData.gender || null,
          notes: formData.notes || null,
          preferences: formData.preferences || null,
          supportLevel: formData.supportLevel || null
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Sessão expirada ou não autenticada. Faça login novamente.");
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            router.push("/login");
          }, 2000);
          return;
        }
        
        let errorMessage = "Erro ao atualizar criança";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (_) {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      router.push(`/children/${childId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL, ROLES.ADMIN]}>
        <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-8 flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-700">Carregando...</div>
        </main>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[ROLES.TERAPEUTA, ROLES.PROFESSOR, ROLES.RESPONSAVEL, ROLES.ADMIN]}>
      <main className="min-h-screen bg-gradient-to-br from-blue-100 via-yellow-50 to-orange-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <BackButton href={`/children/${childId}`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">
                Editar Criança
              </CardTitle>
              <CardDescription>
                Atualize as informações da criança.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nome completo da criança"
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idade *
                    </label>
                    <Input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      required
                      min="1"
                      max="18"
                      placeholder="Idade"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gênero *
                    </label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferências
                  </label>
                  <Input
                    type="text"
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleChange}
                    placeholder="Ex: cores favoritas, atividades preferidas"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grau de Suporte
                  </label>
                  <Select
                    value={formData.supportLevel}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, supportLevel: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixo">Baixo</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                      <SelectItem value="Muito Alto">Muito Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Informações adicionais sobre a criança"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </RoleGuard>
  );
}

