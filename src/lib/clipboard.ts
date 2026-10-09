import { notifyError, notifySuccess } from "@/lib/notify"

/** Chép vào clipboard và báo kết quả cho người dùng. */
export async function copyText(
  text: string,
  successMessage = "Đã sao chép"
): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    notifySuccess(successMessage)
  } catch (error) {
    notifyError(error, "Trình duyệt chưa cho sao chép, vui lòng chép tay")
  }
}

/** Mở bảng chia sẻ của thiết bị (Zalo, Messenger...) nếu có, không thì chép. */
export async function shareText(title: string, text: string): Promise<void> {
  if (typeof navigator.share !== "function") {
    await copyText(text, "Máy chưa hỗ trợ chia sẻ, đã sao chép nội dung")
    return
  }
  try {
    await navigator.share({ title, text })
  } catch (error) {
    // Người dùng tự đóng bảng chia sẻ thì không cần báo lỗi.
    if (error instanceof DOMException && error.name === "AbortError") return
    notifyError(error, "Không chia sẻ được")
  }
}
