'use server';

import { geogebraInterpreter, GeoGebraCommand, GeoGebraInterpreterInput } from '@/ai/flows/geogebra-interpreter';

export async function interpretGeoGebraCommand(
    input: GeoGebraInterpreterInput
): Promise<GeoGebraCommand> {
    return await geogebraInterpreter(input);
}
