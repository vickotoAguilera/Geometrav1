import { TutorMode } from './types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Activity, ListOrdered, BrainCircuit } from "lucide-react";

interface TutorModeSelectorProps {
    mode: TutorMode;
    onModeChange: (mode: TutorMode) => void;
}

export function TutorModeSelector({ mode, onModeChange }: TutorModeSelectorProps) {
    return (
        <Select value={mode} onValueChange={(v) => onModeChange(v as TutorMode)}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Modo Tutor" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="math">
                    <div className="flex items-center gap-2">
                        <Calculator className="h-3 w-3" />
                        <span>Matemáticas</span>
                    </div>
                </SelectItem>
                <SelectItem value="geogebra">
                    <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        <span>GeoGebra</span>
                    </div>
                </SelectItem>
                <SelectItem value="stepByStep">
                    <div className="flex items-center gap-2">
                        <ListOrdered className="h-3 w-3" />
                        <span>Paso a Paso</span>
                    </div>
                </SelectItem>
                <SelectItem value="socratic">
                    <div className="flex items-center gap-2">
                        <BrainCircuit className="h-3 w-3" />
                        <span>Socrático</span>
                    </div>
                </SelectItem>
            </SelectContent>
        </Select>
    );
}
