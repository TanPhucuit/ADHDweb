"use client"

interface DetailedDataTablesProps {
  childId: string
  childName: string
  data: {
    scheduleActivities?: any[]
    medicationLogs?: any[]
    parentActions?: any[]
  }
}

export function DetailedDataTables({ childId, childName, data }: DetailedDataTablesProps) {
  const { scheduleActivities = [], medicationLogs = [], parentActions = [] } = data

  return (
    <div id="detailed-report-data" style={{ display: 'none' }} className="detailed-report-data">
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#111827' }}>
          📊 BÁO CÁO CHI TIẾT - {childName}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '30px' }}>
          Ngày xuất: {new Date().toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>

        {/* SCHEDULE ACTIVITIES */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937', borderBottom: '3px solid #3b82f6', paddingBottom: '8px' }}>
            📅 HOẠT ĐỘNG ĐÃ HOÀN THÀNH ({scheduleActivities.length})
          </h2>
          
          {scheduleActivities.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
              Chưa có hoạt động nào được hoàn thành trong khoảng thời gian này.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#eff6ff', borderBottom: '2px solid #3b82f6' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#1e40af' }}>Ngày</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#1e40af' }}>Hoạt động</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#1e40af' }}>Môn học</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#1e40af' }}>Thời gian</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#1e40af' }}>Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {scheduleActivities.map((activity, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td style={{ padding: '10px 8px', color: '#374151' }}>
                      {activity.completed_at ? new Date(activity.completed_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#111827', fontWeight: '500' }}>
                      {activity.activity_name || 'Không rõ'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {activity.subject || 'Không rõ'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {activity.start_time && activity.end_time 
                        ? `${activity.start_time} - ${activity.end_time}` 
                        : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: activity.status === 'completed' ? '#d1fae5' : '#fef3c7', 
                        color: activity.status === 'completed' ? '#065f46' : '#92400e',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {activity.status === 'completed' ? '✅ Hoàn thành' : '⏳ ' + (activity.status || 'Chờ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MEDICATION LOGS */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937', borderBottom: '3px solid #10b981', paddingBottom: '8px' }}>
            💊 LỊCH SỬ UỐNG THUỐC ({medicationLogs.length})
          </h2>
          
          {medicationLogs.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
              Chưa có bản ghi uống thuốc nào trong khoảng thời gian này.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#d1fae5', borderBottom: '2px solid #10b981' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#065f46' }}>Ngày</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#065f46' }}>Tên thuốc</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#065f46' }}>Liều lượng</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#065f46' }}>Giờ uống</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#065f46' }}>Trạng thái</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#065f46' }}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {medicationLogs.map((log, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td style={{ padding: '10px 8px', color: '#374151' }}>
                      {log.taken_at ? new Date(log.taken_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#111827', fontWeight: '500' }}>
                      {log.medication_name || 'Không rõ'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {log.dosage || 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {log.taken_at ? new Date(log.taken_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: log.taken ? '#d1fae5' : '#fee2e2', 
                        color: log.taken ? '#065f46' : '#991b1b',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {log.taken ? '✅ Đã uống' : '❌ Bỏ lỡ'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280', fontSize: '12px' }}>
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PARENT ACTIONS */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#1f2937', borderBottom: '3px solid #f59e0b', paddingBottom: '8px' }}>
            👨‍👩‍👧 CAN THIỆP CỦA PHỤ HUYNH ({parentActions.length})
          </h2>
          
          {parentActions.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
              Chưa có can thiệp nào từ phụ huynh trong khoảng thời gian này.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#fef3c7', borderBottom: '2px solid #f59e0b' }}>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#92400e' }}>Ngày</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#92400e' }}>Loại can thiệp</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#92400e' }}>Mô tả</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#92400e' }}>Thời gian</th>
                  <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', color: '#92400e' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {parentActions.map((action, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb', background: index % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                    <td style={{ padding: '10px 8px', color: '#374151' }}>
                      {action.created_at ? new Date(action.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#111827', fontWeight: '500' }}>
                      {action.action_type || 'Không rõ'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {action.description || action.message || 'Không có mô tả'}
                    </td>
                    <td style={{ padding: '10px 8px', color: '#6b7280' }}>
                      {action.created_at ? new Date(action.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        background: action.status === 'completed' ? '#d1fae5' : '#dbeafe', 
                        color: action.status === 'completed' ? '#065f46' : '#1e40af',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {action.status === 'completed' ? '✅ Hoàn thành' : '🔵 ' + (action.status || 'Đang xử lý')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* SUMMARY STATISTICS */}
        <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px', color: '#1e40af' }}>
            📈 TỔNG KẾT
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                {scheduleActivities.filter((a: any) => a.status === 'completed').length}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Hoạt động hoàn thành
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                {medicationLogs.filter((l: any) => l.taken).length}/{medicationLogs.length}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Tuân thủ uống thuốc
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {parentActions.length}
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                Lần can thiệp
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
