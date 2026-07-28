import { router } from '../router';
import { createLayout } from '../components/layout';
import { getMeetings, createMeeting, deleteMeeting, showToast, generateMeetingSummary } from '../api';

export function renderCalendar() {
  const content = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
            <h1 style="font-size: 1.8rem; font-weight: 700; margin: 0 0 0.25rem 0;">Calendar</h1>
            <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">Manage meetings and schedule your day.</p>
        </div>
        <div style="display: flex; gap: 1rem;">
            <button class="gradient-btn" onclick="(window as any).openAddMeetingModal()">+ Schedule Meeting</button>
        </div>
    </div>

    <div class="glass-card" style="padding: 1rem; height: calc(100vh - 210px); display: flex; flex-direction: column; overflow: hidden;">
        <div id="fullCalendarEl" style="flex: 1; height: 100%;"></div>
    </div>

    <!-- Add Meeting Modal -->
    <div id="addMeetingModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 500px; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.25rem;">Schedule Meeting</h2>
          <button onclick="(window as any).closeAddMeetingModal()" style="background: transparent; border: none; color: var(--text-secondary); font-size: 1.25rem; cursor: pointer;">&times;</button>
        </div>
        <form id="addMeetingForm" style="display: flex; flex-direction: column; gap: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Title</label>
            <input type="text" id="mTitle" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
          </div>
          <div style="display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Start Time</label>
              <input type="datetime-local" id="mStart" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">End Time</label>
              <input type="datetime-local" id="mEnd" required style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
            </div>
          </div>
          <div>
            <label style="display: block; font-size: 0.8rem; margin-bottom: 0.4rem; color: var(--text-secondary);">Meeting URL (Zoom/Teams)</label>
            <input type="url" id="mUrl" style="width: 100%; background: var(--bg-color); border: 1px solid var(--border-color); color: white; padding: 0.75rem; border-radius: var(--border-radius-sm); outline: none;">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1rem;">
            <button type="button" onclick="(window as any).closeAddMeetingModal()" style="background: transparent; border: 1px solid var(--border-color); color: white; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">Cancel</button>
            <button type="submit" class="gradient-btn">Schedule</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Meeting Details Modal -->
    <div id="meetingDetailsModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 1000; align-items: center; justify-content: center;">
      <div class="glass-card" style="width: 100%; max-width: 500px; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; font-size: 1.25rem;" id="detTitle">Meeting Title</h2>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button id="btnDeleteMeeting" class="icon-btn" style="color: var(--danger-color); border: none; background: transparent; cursor: pointer; font-size: 1.1rem;" title="Delete Meeting">🗑️</button>
            <button onclick="(window as any).closeMeetingDetailsModal()" style="background: transparent; border: none; color: var(--text-secondary); font-size: 1.25rem; cursor: pointer;">&times;</button>
          </div>
        </div>
        <div style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--text-secondary);" id="detTime"></div>
        <div style="margin-bottom: 1rem;" id="detUrl"></div>
        
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="margin: 0; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> AI Summary</h3>
                <button id="btnAiSummary" class="gradient-btn" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">Generate</button>
            </div>
            <div id="detSummary" style="font-size: 0.85rem; color: var(--text-secondary); white-space: pre-wrap;"></div>
        </div>
      </div>
    </div>
  `;
  
  router.mount(createLayout('/calendar', content));
  
  // Modals
  (window as any).openAddMeetingModal = () => { document.getElementById('addMeetingModal')!.style.display = 'flex'; };
  (window as any).closeAddMeetingModal = () => { document.getElementById('addMeetingModal')!.style.display = 'none'; };
  (window as any).closeMeetingDetailsModal = () => { document.getElementById('meetingDetailsModal')!.style.display = 'none'; };

  const FullCalendar = (window as any).FullCalendar;
  
  let calendar: any;

  if (FullCalendar) {
    const calendarEl = document.getElementById('fullCalendarEl');
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      height: '100%',
      expandRows: true,
      slotMinTime: '07:00:00',
      slotMaxTime: '20:00:00',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      editable: true,
      events: async function(fetchInfo: any, successCallback: any, failureCallback: any) {
          try {
              const res = await getMeetings({ start_date: fetchInfo.startStr, end_date: fetchInfo.endStr });
              const events = (res.data || []).map((m: any) => ({
                  id: m.id,
                  title: m.title,
                  start: m.start_time,
                  end: m.end_time,
                  color: m.color_category || '#4f8cff',
                  extendedProps: {
                      meeting_url: m.meeting_url,
                      ai_summary: m.ai_summary,
                      action_items: m.action_items
                  }
              }));
              successCallback(events);
          } catch(e) {
              console.error(e);
              failureCallback(e);
          }
      },
      eventClick: function(info: any) {
          const m = info.event;
          document.getElementById('detTitle')!.innerText = m.title;
          document.getElementById('detTime')!.innerText = m.start.toLocaleString() + ' - ' + (m.end ? m.end.toLocaleString() : '');
          
          if (m.extendedProps.meeting_url) {
              document.getElementById('detUrl')!.innerHTML = `<a href="${m.extendedProps.meeting_url}" target="_blank" style="color: var(--secondary-color); text-decoration: none;">Join Meeting &rarr;</a>`;
          } else {
              document.getElementById('detUrl')!.innerHTML = '';
          }
          
          const summaryEl = document.getElementById('detSummary')!;
          if (m.extendedProps.ai_summary) {
              summaryEl.innerText = m.extendedProps.ai_summary + "\n\nAction Items:\n" + m.extendedProps.action_items;
          } else {
              summaryEl.innerText = 'No summary generated yet.';
          }
          
          const btnAi = document.getElementById('btnAiSummary')!;
          btnAi.onclick = async () => {
              btnAi.innerText = 'Generating...';
              try {
                  const res = await generateMeetingSummary(m.id);
                  summaryEl.innerText = res.ai_summary + "\\n\\nAction Items:\\n" + res.action_items;
                  showToast('AI Summary Generated', 'success');
                  calendar.refetchEvents();
              } catch (e: any) {
                  showToast('Failed to generate summary', 'error');
              } finally {
                  btnAi.innerText = 'Generate';
              }
          };

          const btnDelete = document.getElementById('btnDeleteMeeting')!;
          btnDelete.onclick = async () => {
              if (!confirm('Are you sure you want to delete this meeting?')) return;
              try {
                  await deleteMeeting(m.id);
                  showToast('Meeting deleted successfully', 'success');
                  (window as any).closeMeetingDetailsModal();
                  calendar.refetchEvents();
              } catch (e: any) {
                  showToast(e.message || 'Failed to delete meeting', 'error');
              }
          };

          document.getElementById('meetingDetailsModal')!.style.display = 'flex';
      }
    });
    calendar.render();
  }
  
  // Add Meeting Form
  const form = document.getElementById('addMeetingForm') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
      if (btn) btn.innerText = 'Scheduling...';
      
      const payload = {
          title: (document.getElementById('mTitle') as HTMLInputElement).value,
          start_time: (document.getElementById('mStart') as HTMLInputElement).value,
          end_time: (document.getElementById('mEnd') as HTMLInputElement).value,
          meeting_url: (document.getElementById('mUrl') as HTMLInputElement).value,
          color_category: '#7c3aed'
      };
      
      try {
          await createMeeting(payload);
          showToast('Meeting scheduled', 'success');
          form.reset();
          (window as any).closeAddMeetingModal();
          if (calendar) calendar.refetchEvents();
      } catch (err: any) {
          showToast(err.message || 'Failed to schedule', 'error');
      } finally {
          if (btn) btn.innerText = 'Schedule';
      }
  });
}
