'use client';

import { useState } from 'react';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { curriculum } from '@/data/curriculum';
import Link from 'next/link';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function EjerciciosPage() {
    const [selectedGrade, setSelectedGrade] = useState<string | null>(null);

    const grade = selectedGrade ? curriculum.find(g => g.id === selectedGrade) : null;

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Ejercicios Interactivos</h1>
                    <p className="text-muted-foreground">
                        Practica con ejercicios generados automáticamente por IA
                    </p>
                </div>

                {!selectedGrade ? (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">Selecciona tu curso</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {curriculum.map((grade) => (
                                <Card
                                    key={grade.id}
                                    className="cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => setSelectedGrade(grade.id)}
                                >
                                    <CardHeader>
                                        <CardTitle className="text-2xl">{grade.name}</CardTitle>
                                        <CardDescription>
                                            {grade.subjects.length} materias disponibles
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button className="w-full">
                                            Ver Materias
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : grade ? (
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <Button variant="outline" onClick={() => setSelectedGrade(null)}>
                                ← Volver
                            </Button>
                            <h2 className="text-2xl font-semibold">{grade.name}</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {grade.subjects.map((subject) => (
                                <Link
                                    key={subject.id}
                                    href={`/ejercicios/${grade.id}/${subject.id}`}
                                >
                                    <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                                        <CardHeader>
                                            <div className="text-4xl mb-2">{subject.icon}</div>
                                            <CardTitle>{subject.name}</CardTitle>
                                            <CardDescription>
                                                {subject.description}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <BookOpen className="w-4 h-4" />
<<<<<<< HEAD
                                                    <span>20 ejercicios</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>0/20 completados</span>
=======
                                                    <span>{subject.exerciseCount || 20} ejercicios</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <TrendingUp className="w-4 h-4" />
                                                    <span>0/{subject.exerciseCount || 20} completados</span>
>>>>>>> 7eac5583c1b9fa73578cdd07b34238f755b8e636
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            {/* Ejercicios Mixtos */}
                            <Link href={`/ejercicios/${grade.id}/mixto`}>
                                <Card className="h-full hover:border-primary transition-colors cursor-pointer bg-gradient-to-br from-primary/10 to-primary/5">
                                    <CardHeader>
                                        <div className="text-4xl mb-2">🎲</div>
                                        <CardTitle>Mixto</CardTitle>
                                        <CardDescription>
                                            Todas las materias combinadas
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <BookOpen className="w-4 h-4" />
                                                <span>50 ejercicios</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <TrendingUp className="w-4 h-4" />
                                                <span>0/50 completados</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
