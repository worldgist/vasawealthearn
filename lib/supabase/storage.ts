import { createClient } from "./client"

export async function uploadDepositReceipt(file: File, userId: string, depositId: string) {
  const supabase = createClient()

  // Create a unique filename with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${depositId}-${timestamp}.${fileExt}`

  const { data, error } = await supabase.storage.from("deposit-receipts").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw error
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from("deposit-receipts").getPublicUrl(fileName)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function uploadKYCDocument(file: File, userId: string, documentType: string) {
  const supabase = createClient()

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${documentType}-${timestamp}.${fileExt}`

  const { data, error } = await supabase.storage.from("kyc-documents").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data: urlData } = supabase.storage.from("kyc-documents").getPublicUrl(fileName)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function uploadSupportAttachment(file: File, userId: string, ticketId: string) {
  const supabase = createClient()

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const fileExt = file.name.split(".").pop()
  const fileName = `${userId}/${ticketId}-${timestamp}.${fileExt}`

  const { data, error } = await supabase.storage.from("support-attachments").upload(fileName, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data: urlData } = supabase.storage.from("support-attachments").getPublicUrl(fileName)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()

  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) {
    throw error
  }
}
