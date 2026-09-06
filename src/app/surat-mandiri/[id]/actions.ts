"use server";

import { tambahPermohonan } from "@/modules/surat";

export type ActionState = { error?: string; success?: boolean };

export async function submitPermohonan(
  _prevState: ActionState,
  formData: FormData,
  suratId: number,
): Promise<ActionState> {
  const idPend = formData.get("id_pemohon");
  const noHp = formData.get("no_hp_aktif");

  if (!idPend || String(idPend).trim() === "") {
    return { error: "Pilih pemohon terlebih dahulu." };
  }

  // Kumpulkan semua field form sebagai isian
  const isian: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "_action") {
      isian[key] = String(value);
    }
  }

  try {
    await tambahPermohonan({
      id_pemohon: parseInt(String(idPend), 10),
      id_surat: suratId,
      isian_form: JSON.stringify(isian),
      status: 0,
      no_hp_aktif: String(noHp || "").trim() || undefined,
    });
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
