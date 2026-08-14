export interface TimetableSlot {
  id: string;
  day: string;
  period: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: string;
  room: string;
  type: "lecture" | "lab" | "break" | "assembly" | "sports" | "library";
}

export interface ClassTimetable {
  class: string;
  section: string;
  slots: TimetableSlot[];
}

const periods = [
  { period: 1, startTime: "08:00", endTime: "08:45" },
  { period: 2, startTime: "08:45", endTime: "09:30" },
  { period: 3, startTime: "09:30", endTime: "09:45", isBreak: true },
  { period: 4, startTime: "09:45", endTime: "10:30" },
  { period: 5, startTime: "10:30", endTime: "11:15" },
  { period: 6, startTime: "11:15", endTime: "12:00" },
  { period: 7, startTime: "12:00", endTime: "12:45", isBreak: true },
  { period: 8, startTime: "12:45", endTime: "13:30" },
  { period: 9, startTime: "13:30", endTime: "14:15" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const subjects = [
  { subject: "Mathematics", teacher: "Rajesh Kumar", room: "Room 101" },
  { subject: "Physics", teacher: "Priya Menon", room: "Room 102" },
  { subject: "Chemistry", teacher: "Suresh Nair", room: "Lab 1" },
  { subject: "English", teacher: "Ananya Iyer", room: "Room 103" },
  { subject: "Hindi", teacher: "Deepa Sharma", room: "Room 104" },
  { subject: "History", teacher: "Manoj Verma", room: "Room 201" },
  { subject: "Computer Science", teacher: "Lakshmi Rao", room: "CS Lab" },
  { subject: "Physical Education", teacher: "Arvind Patel", room: "Ground" },
  { subject: "Biology", teacher: "Vikram Reddy", room: "Lab 2" },
];

function generateTimetable(className: string, section: string): TimetableSlot[] {
  const slots: TimetableSlot[] = [];
  let id = 0;

  days.forEach((day) => {
    periods.forEach((p) => {
      id++;
      if (p.period === 3) {
        slots.push({ id: `${className}${section}-${id}`, day, period: p.period, startTime: p.startTime, endTime: p.endTime, subject: "Short Break", teacher: "", room: "", type: "break" });
      } else if (p.period === 7) {
        slots.push({ id: `${className}${section}-${id}`, day, period: p.period, startTime: p.startTime, endTime: p.endTime, subject: "Lunch Break", teacher: "", room: "", type: "break" });
      } else if (p.period === 1 && day === "Monday") {
        slots.push({ id: `${className}${section}-${id}`, day, period: p.period, startTime: p.startTime, endTime: p.endTime, subject: "Assembly", teacher: "", room: "Auditorium", type: "assembly" });
      } else if (p.period === 9 && day === "Friday") {
        slots.push({ id: `${className}${section}-${id}`, day, period: p.period, startTime: p.startTime, endTime: p.endTime, subject: "Sports", teacher: "Arvind Patel", room: "Ground", type: "sports" });
      } else if (p.period === 8 && day === "Wednesday") {
        slots.push({ id: `${className}${section}-${id}`, day, period: p.period, startTime: p.startTime, endTime: p.endTime, subject: "Library", teacher: "", room: "Library", type: "library" });
      } else {
        const subj = subjects[(id + day.length) % subjects.length];
        slots.push({ id: `${className}${section}-${id}`, day, period: p.period, startTime: p.startTime, endTime: p.endTime, subject: subj.subject, teacher: subj.teacher, room: subj.room, type: subj.subject === "Chemistry" || subj.subject === "Biology" || subj.subject === "Computer Science" ? "lab" : "lecture" });
      }
    });
  });

  return slots;
}

export const classTimetables: ClassTimetable[] = [
  { class: "10", section: "A", slots: generateTimetable("10", "A") },
  { class: "10", section: "B", slots: generateTimetable("10", "B") },
  { class: "9", section: "A", slots: generateTimetable("9", "A") },
  { class: "9", section: "B", slots: generateTimetable("9", "B") },
  { class: "12", section: "A", slots: generateTimetable("12", "A") },
  { class: "11", section: "A", slots: generateTimetable("11", "A") },
];

export const periodTimings = periods;
export const weekDays = days;
