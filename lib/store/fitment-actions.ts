"use server";

import {
  getFitmentsForProduct as adapterGetFitmentsForProduct,
  listMakes as adapterListMakes,
  listModels as adapterListModels,
  listSubmodels as adapterListSubmodels,
  listYears as adapterListYears,
} from "@/lib/store/fitments-source";

export async function listMakesAction() {
  return await adapterListMakes();
}

export async function listModelsAction(make: string) {
  return await adapterListModels(make);
}

export async function listYearsAction(make: string, model: string) {
  return await adapterListYears(make, model);
}

export async function listSubmodelsAction(
  make: string,
  model: string,
  year: number
) {
  return await adapterListSubmodels(make, model, year);
}

export async function getFitmentsForProductAction(productSlug: string) {
  return await adapterGetFitmentsForProduct(productSlug);
}
