interface OpenAIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

const ENHANCED_SYSTEM_PROMPT = `Bạn là Dr. AI, một chuyên gia tư vấn ADHD (Rối loạn tăng động giảm chú ý) chuyên nghiệp và thân thiện dành cho gia đình Việt Nam.

CHUYÊN MÔN CỦA BẠN:
- Tư vấn ADHD toàn diện cho trẻ em và gia đình
- Phân tích dữ liệu theo dõi tập trung và hành vi
- Tạo kế hoạch can thiệp cá nhân hóa
- Hướng dẫn sử dụng công nghệ hỗ trợ ADHD
- Tư vấn về thuốc và phương pháp điều trị

NGUYÊN TẮC TƯ VẤN:
- Luôn trả lời bằng tiếng Việt, ngôn ngữ thân thiện
- Sử dụng dữ liệu cá nhân để đưa ra lời khuyên cụ thể
- Khuyến khích và tích cực, tránh phán xét
- Đưa ra giải pháp thực tế, có thể áp dụng ngay
- Giải thích khoa học một cách dễ hiểu

CÁCH PHẢN HỒI:
- Phân tích tình hình dựa trên dữ liệu được cung cấp
- Đưa ra 2-3 khuyến nghị cụ thể
- Gợi ý các bước hành động tiếp theo
- Khi cần, khuyên tham khảo bác sĩ chuyên khoa

LƯU Ý AN TOÀN:
- Không thay thế ý kiến bác sĩ chuyên khoa
- Khuyến khích theo dõi y tế định kỳ
- Cảnh báo khi cần can thiệp khẩn cấp`

const FALLBACK_SYSTEM_PROMPT = `Bạn là một trợ lý AI chuyên về ADHD (Rối loạn tăng động giảm chú ý) dành cho phụ huynh Việt Nam. 

NHIỆM VỤ CHÍNH:
- Tư vấn về ADHD và cách hỗ trợ trẻ
- Tạo thời gian biểu học tập phù hợp
- Đưa ra lời khuyên nuôi dạy con
- Giải đáp thắc mắc về giáo dục

QUY TẮC TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt
- Sử dụng ngôn ngữ thân thiện, dễ hiểu
- Đưa ra lời khuyên thực tế, khoa học
- Khi tạo thời gian biểu, sử dụng định dạng bảng Markdown
- Chia nhỏ thông tin thành các phần rõ ràng
- Luôn khuyến khích và tích cực

LƯU Ý:
- Không thay thế ý kiến bác sĩ chuyên khoa
- Khuyến khích tham khảo chuyên gia khi cần
- Tập trung vào giải pháp thực tế cho gia đình`

export async function generateAIResponse(messages: OpenAIMessage[]): Promise<string> {
  try {
    let apiKey = ""
    let model = "gpt-4o-mini"

    if (typeof window !== "undefined") {
      apiKey = localStorage.getItem("openai_api_key") || ""
      model = localStorage.getItem("openai_model") || "gpt-4o-mini"
    }

    // Fallback to environment variables if localStorage is empty
    if (!apiKey) {
      apiKey = process.env.OPENAI_API_KEY || ""
    }
    if (!model) {
      model = process.env.OPENAI_MODEL || "gpt-4o-mini"
    }

    if (!apiKey) {
      throw new Error("OpenAI API key not configured")
    }

    // Use enhanced system prompt if we have context data
    const hasContextData = messages.some((msg) => msg.role === "system" && msg.content.includes("Thông tin về trẻ:"))

    const systemPrompt = hasContextData ? ENHANCED_SYSTEM_PROMPT : FALLBACK_SYSTEM_PROMPT

    // Ensure we have a system message at the beginning
    const processedMessages: OpenAIMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.filter((msg) => msg.role !== "system" || msg.content.includes("Thông tin về trẻ:")),
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: processedMessages,
        max_tokens: 1500,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`)
    }

    const data: OpenAIResponse = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenAI")
    }

    return data.choices[0].message.content || "Xin lỗi, tôi không thể tạo phản hồi lúc này."
  } catch (error) {
    console.error("OpenAI API Error:", error)

    // Fallback to mock response if API fails
    return getFallbackResponse(messages)
  }
}

function getFallbackResponse(messages: OpenAIMessage[]): string {
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop()
  const input = lastUserMessage?.content.toLowerCase() || ""

  if (input.includes("thời gian biểu") || input.includes("lịch học") || input.includes("schedule")) {
    return `## 📅 Thời gian biểu học tập cho trẻ ADHD

| Thời gian | Hoạt động | Kỹ thuật ADHD | Ghi chú |
|-----------|-----------|---------------|---------|
| 19:00-19:15 | Chuẩn bị học | Thở sâu, tập trung | Tạo không gian yên tĩnh |
| 19:15-19:45 | **Toán học** | Pomodoro 25 phút | Môn khó nhất trước |
| 19:45-20:00 | Nghỉ giải lao | Vận động nhẹ | Giải phóng năng lượng |
| 20:00-20:30 | **Tiếng Anh** | Flashcard, game | Học qua trò chơi |
| 20:30-20:45 | Nghỉ ngơi | Nghe nhạc thư giãn | Phục hồi tập trung |
| 20:45-21:15 | **Văn học** | Đọc to, thảo luận | Kích thích sáng tạo |

### 💡 **Mẹo cho trẻ ADHD:**
- ✅ Chia nhỏ bài học thành từng phần 15-20 phút
- ✅ Sử dụng timer để tạo cảm giác khẩn cấp tích cực
- ✅ Thưởng ngay khi hoàn thành mỗi phần
- ✅ Cho phép fidget toys khi học

*⚠️ Lưu ý: Đây là mẫu tham khảo khi API offline.*`
  }

  if (input.includes("tập trung") || input.includes("focus") || input.includes("pomodoro")) {
    return `## 🧠 Kỹ thuật cải thiện tập trung cho trẻ ADHD

### **1. Phương pháp Pomodoro ADHD**
- ⏰ **15-20 phút học** (thay vì 25 phút tiêu chuẩn)
- 🎯 **5 phút nghỉ** với hoạt động vận động
- 🏆 **Thưởng ngay** sau mỗi phiên hoàn thành

### **2. Môi trường học tập tối ưu**
- 🔇 **Giảm tiếng ồn**: Tai nghe chống ồn hoặc nhạc trắng
- 📱 **Loại bỏ phân tâm**: Cất điện thoại, đồ chơi
- 💡 **Ánh sáng đủ**: Tránh quá sáng hoặc quá tối
- 🪑 **Chỗ ngồi phù hợp**: Ghế có thể xoay, bóng fidget

### **3. Kỹ thuật "Body Doubling"**
- 👥 Học cùng người khác (không cần tương tác)
- 📹 Video call với bạn cùng học
- 🎵 "Study with me" videos trên YouTube

### **4. Hệ thống thưởng tức thì**
- ⭐ Điểm số sau mỗi bài tập
- 🎮 5 phút chơi game sau 20 phút học
- 🍎 Snack yêu thích khi hoàn thành

*💊 Lưu ý: Nếu con đang dùng thuốc ADHD, hãy tận dụng "golden hours" khi thuốc phát huy tác dụng tốt nhất.*`
  }

  if (input.includes("thuốc") || input.includes("medication") || input.includes("uống")) {
    return `## 💊 Hướng dẫn quản lý thuốc ADHD

### **Các loại thuốc phổ biến:**
- **Methylphenidate** (Ritalin, Concerta): Tác dụng 4-12 giờ
- **Amphetamine** (Adderall): Tác dụng 4-6 giờ  
- **Atomoxetine** (Strattera): Không kích thích, tác dụng 24 giờ

### **Lịch uống thuốc hiệu quả:**
- 🌅 **Sáng sớm**: 6:30-7:00 (trước khi đến trường)
- 🍽️ **Với thức ăn**: Giảm tác dụng phụ
- ⏰ **Đúng giờ**: Dùng app nhắc nhở
- 📝 **Ghi chép**: Theo dõi hiệu quả và tác dụng phụ

### **Tác dụng phụ thường gặp:**
- 😴 Mất ngủ → Uống sớm hơn
- 🍽️ Giảm cảm giác đói → Ăn sáng đầy đủ
- 😢 Thay đổi tâm trạng → Báo bác sĩ ngay

### **⚠️ Quan trọng:**
- Không tự ý thay đổi liều lượng
- Theo dõi chiều cao, cân nặng định kỳ
- Tái khám theo lịch hẹn bác sĩ
- Báo ngay nếu có tác dụng phụ nghiêm trọng

*🏥 Luôn tham khảo bác sĩ chuyên khoa trước khi thay đổi phác đồ điều trị.*`
  }

  if (input.includes("đánh giá") || input.includes("tiến độ") || input.includes("adhd")) {
    return `## 📊 Đánh giá tiến độ ADHD

### **Các chỉ số cần theo dõi:**

#### **1. Khả năng tập trung**
- ⏱️ Thời gian tập trung liên tục
- 🎯 Hoàn thành nhiệm vụ đúng hạn
- 📚 Chất lượng bài tập về nhà

#### **2. Kiểm soát hành vi**
- 🏃 Mức độ tăng động
- 🤔 Khả năng suy nghĩ trước khi hành động
- 😌 Kiểm soát cảm xúc

#### **3. Kỹ năng xã hội**
- 👫 Tương tác với bạn bè
- 🗣️ Lắng nghe và chờ đợi lượt
- 🤝 Hợp tác trong nhóm

### **Công cụ đánh giá:**
- 📋 **Vanderbilt Scale**: Đánh giá tại nhà và trường
- 📊 **ADHD Rating Scale**: Theo dõi hàng tuần
- 📱 **Apps theo dõi**: Mood tracking, focus timer

### **Dấu hiệu tiến bộ tích cực:**
- ✅ Hoàn thành bài tập độc lập
- ✅ Ít xung đột với anh chị em
- ✅ Ngủ ngon hơn
- ✅ Tự tin hơn ở trường

### **Khi nào cần tái khám:**
- 🔴 Tác dụng phụ của thuốc tăng
- 🔴 Điểm số ở trường giảm đáng kể
- 🔴 Hành vi tăng động tăng bất thường
- 🔴 Xuất hiện triệu chứng trầm cảm/lo âu

*📞 Liên hệ bác sĩ ngay nếu có bất kỳ lo ngại nào về sức khỏe tâm thần của con.*`
  }

  return `## 🤖 Dr. AI - Trợ lý ADHD của bạn

Xin chào! Tôi là Dr. AI, chuyên gia tư vấn ADHD. Hiện tại hệ thống đang gặp sự cố nhỏ, nhưng tôi vẫn có thể hỗ trợ bạn với những chủ đề sau:

### **🎯 Tôi có thể giúp bạn:**
- 📅 **Tạo lịch trình học tập** phù hợp với trẻ ADHD
- 🧠 **Kỹ thuật cải thiện tập trung** (Pomodoro, mindfulness)
- 💊 **Tư vấn về thuốc ADHD** và cách sử dụng
- 📊 **Đánh giá tiến độ** và theo dõi triệu chứng
- 🏆 **Hệ thống động lực** và khen thưởng
- 👨‍👩‍👧‍👦 **Lời khuyên nuôi dạy con** ADHD

### **💡 Câu hỏi gợi ý:**
- "Làm thế nào để con tôi tập trung học bài?"
- "Tạo lịch trình học tập cho trẻ 8 tuổi"
- "Con tôi không chịu uống thuốc, phải làm sao?"
- "Cách xây dựng thói quen tích cực"

### **⚠️ Lưu ý quan trọng:**
Tôi chỉ là công cụ hỗ trợ, không thay thế ý kiến bác sĩ chuyên khoa. Luôn tham khảo chuyên gia y tế cho những quyết định quan trọng về sức khỏe con bạn.

*🔄 Hệ thống sẽ sớm hoạt động bình thường. Cảm ơn bạn đã kiên nhẫn!*`
}
