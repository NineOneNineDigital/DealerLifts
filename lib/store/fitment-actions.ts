"use server";

import {
  getFitmentsForProduct as adapterGetFitmentsForProduct,
  listMakes as adapterListMakes,
  listModels as adapterListModels,
  listSubmodels as adapterListSubmodels,
  listYears as adapterListYears,
} from "@/lib/store/fitments-source";

export async function listYearsAction() {
  return await adapterListYears();
}

export async function listMakesAction(year: number) {
  return await adapterListMakes(year);
}

export async function listModelsAction(year: number, make: string) {
  return await adapterListModels(year, make);
}

export async function listSubmodelsAction(
  year: number,
  make: string,
  model: string
) {
  return await adapterListSubmodels(year, make, model);
}

export async function getFitmentsForProductAction(productSlug: string) {
  return await adapterGetFitmentsForProduct(productSlug);
}
