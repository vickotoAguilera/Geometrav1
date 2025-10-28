'use client';

import { useState, useRef } from 'react';
import { useUser } from '@/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAiResponse } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function UploadAnalysis() {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('El archivo es demasiado grande. El límite es de 10MB.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError('El archivo es demasiado grande. El límite es de 10MB.');
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setError(null);
      setAnalysisResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyzeClick = async () => {
    if (!file || !user) {
      setError('Por favor, selecciona un archivo e inicia sesión para analizar.');
      return;
    }

    setIsUploading(true);
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    setUploadProgress(0); // Reset progress

    try {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;
        setUploadProgress(progress);
        if (progress === 100) clearInterval(interval);
      }, 200);

      const storage = getStorage();
      const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${file.name}`);
      
      await uploadBytes(storageRef, file);
      
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      
      toast({
        title: 'Análisis en curso',
        description: 'La IA está procesando tu documento. Esto puede tardar unos segundos...',
      });
      
      const photoDataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });

      const prompt = `Analiza el siguiente documento: ${file.name}. Extrae los puntos clave, resume el contenido y, si contiene problemas o ejercicios, sugiere cómo resolverlos.`;
      const { response } = await getAiResponse(prompt, [], photoDataUri);
      
      setAnalysisResult(response);

    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'Ocurrió un error desconocido durante el análisis.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error en el análisis',
        description: errorMessage,
      });
    } finally {
      setIsAnalyzing(false);
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center bg-card">
        <p className="text-muted-foreground">
          Por favor, inicia sesión para poder analizar tus documentos.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8">
      <Card
        className="border-2 border-dashed hover:border-primary transition-colors"
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="p-6 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Arrastra y suelta un archivo o haz clic para seleccionar
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Soporta PDF, DOCX, y archivos de imagen (máx 10MB)
          </p>
          {file && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium">
              <File className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex justify-center">
        <Button
          onClick={handleAnalyzeClick}
          disabled={!file || isAnalyzing}
          size="lg"
        >
          {isAnalyzing ? 'Analizando...' : 'Analizar con IA'}
        </Button>
      </div>
      
      {(isUploading || isAnalyzing) && analysisResult == null && (
        <Card>
            <CardHeader>
                <CardTitle>Procesando...</CardTitle>
                <CardDescription>
                {isUploading ? 'Subiendo tu archivo al servidor de forma segura.' : 'La IA está leyendo y analizando tu documento.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Progress value={isUploading ? uploadProgress : 100} className="w-full" />
                <p className="text-center text-sm text-muted-foreground mt-2">
                {isUploading ? `${uploadProgress}% subido` : 'Análisis casi listo...'}
                </p>
            </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Análisis de la IA</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {analysisResult}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
