import { Language, Service, Specialist, Translations } from './types';

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: { [Language.EN]: 'Integrated Teeth and Oral Cavity Test', [Language.LV]: 'Integrēta zobu un mutes dobuma pārbaude', [Language.RU]: 'Комплексное обследование зубов и полости рта' },
    description: { [Language.EN]: 'Comprehensive diagnostic check-up and plan.', [Language.LV]: 'Visaptveroša diagnostika un plāns.', [Language.RU]: 'Комплексная диагностика и план.' },
    price: 50,
    durationMinutes: 45,
    icon: ''
  },
  {
    id: 's2',
    name: { [Language.EN]: 'Check-Ups and Dental Hygiene', [Language.LV]: 'Pārbaudes un zobu higiēna', [Language.RU]: 'Осмотры и гигиена зубов' },
    description: { [Language.EN]: 'Professional cleaning and routine exam.', [Language.LV]: 'Profesionāla tīrīšana un kārtējā pārbaude.', [Language.RU]: 'Профессиональная чистка и осмотр.' },
    price: 65,
    durationMinutes: 60,
    icon: ''
  },
  {
    id: 's3',
    name: { [Language.EN]: 'Children’s Dentistry', [Language.LV]: 'Bērnu zobārstniecība', [Language.RU]: 'Детская стоматология' },
    description: { [Language.EN]: 'Gentle care for young patients.', [Language.LV]: 'Maiga aprūpe mazajiem pacientiem.', [Language.RU]: 'Бережный уход за маленькими пациентами.' },
    price: 45,
    durationMinutes: 30,
    icon: ''
  },
  {
    id: 's4',
    name: { [Language.EN]: 'Dental Treatment', [Language.LV]: 'Zobu ārstēšana', [Language.RU]: 'Лечение зубов' },
    description: { [Language.EN]: 'Caries treatment and fillings.', [Language.LV]: 'Kariesa ārstēšana un plombēšana.', [Language.RU]: 'Лечение кариеса и пломбирование.' },
    price: 60,
    durationMinutes: 60,
    icon: ''
  },
  {
    id: 's5',
    name: { [Language.EN]: 'Sedative treatment', [Language.LV]: 'Ārstēšana sedācijā', [Language.RU]: 'Лечение под седацией' },
    description: { [Language.EN]: 'Anxiety-free treatment options.', [Language.LV]: 'Ārstēšana bez stresa un raizēm.', [Language.RU]: 'Лечение без стресса и тревоги.' },
    price: 100,
    durationMinutes: 60,
    icon: ''
  },
  {
    id: 's6',
    name: { [Language.EN]: 'Teeth Whitening', [Language.LV]: 'Zobu balināšana', [Language.RU]: 'Отбеливание зубов' },
    description: { [Language.EN]: 'Professional whitening for a brighter smile.', [Language.LV]: 'Profesionāla balināšana mirdzošam smaidam.', [Language.RU]: 'Профессиональное отбеливание.' },
    price: 250,
    durationMinutes: 90,
    icon: ''
  },
  {
    id: 's7',
    name: { [Language.EN]: 'Surgery', [Language.LV]: 'Ķirurģija', [Language.RU]: 'Хирургия' },
    description: { [Language.EN]: 'Extractions and surgical procedures.', [Language.LV]: 'Zobu raušana un ķirurģija.', [Language.RU]: 'Удаление и хирургические процедуры.' },
    price: 120,
    durationMinutes: 60,
    icon: ''
  },
  {
    id: 's8',
    name: { [Language.EN]: 'Prosthetics', [Language.LV]: 'Protezēšana', [Language.RU]: 'Протезирование' },
    description: { [Language.EN]: 'Crowns, bridges, and dentures.', [Language.LV]: 'Kroņi, tilti un protēzes.', [Language.RU]: 'Коронки, мосты и протезы.' },
    price: 400,
    durationMinutes: 60,
    icon: ''
  },
  {
    id: 's9',
    name: { [Language.EN]: 'Implantology', [Language.LV]: 'Implantoloģija', [Language.RU]: 'Имплантология' },
    description: { [Language.EN]: 'Restoring missing teeth with implants.', [Language.LV]: 'Zobu atjaunošana ar implantiem.', [Language.RU]: 'Восстановление зубов имплантами.' },
    price: 750,
    durationMinutes: 90,
    icon: ''
  },
  {
    id: 's10',
    name: { [Language.EN]: 'Restoration of Jaw Bone Tissues', [Language.LV]: 'Žokļa kaula audu atjaunošana', [Language.RU]: 'Восстановление костной ткани челюсти' },
    description: { [Language.EN]: 'Bone augmentation and reconstruction.', [Language.LV]: 'Kaula audzēšana un rekonstrukcija.', [Language.RU]: 'Наращивание и реконструкция кости.' },
    price: 500,
    durationMinutes: 90,
    icon: ''
  }
];

export const SPECIALISTS: Specialist[] = [
  {
    id: 'd1',
    name: 'Dr. Anna Bērziņa',
    role: { [Language.EN]: 'Lead Surgeon', [Language.LV]: 'Galvenā ķirurģe', [Language.RU]: 'Главный хирург' },
    photoUrl: 'https://picsum.photos/100/100?random=1',
    // Surgery, Implants, Bone Restoration, Prosthetics
    specialties: ['s7', 's9', 's10', 's8']
  },
  {
    id: 'd2',
    name: 'Dr. Jānis Liepiņš',
    role: { [Language.EN]: 'General Dentist', [Language.LV]: 'Vispārējais zobārsts', [Language.RU]: 'Стоматолог общей практики' },
    photoUrl: 'https://picsum.photos/100/100?random=2',
    // Integrated Test, Hygiene, Treatment, Whitening, Prosthetics
    specialties: ['s1', 's2', 's4', 's6', 's8']
  },
  {
    id: 'd3',
    name: 'Dr. Elena Petrova',
    role: { [Language.EN]: 'Pediatric Dentist', [Language.LV]: 'Bērnu zobārste', [Language.RU]: 'Детский стоматолог' },
    photoUrl: 'https://picsum.photos/100/100?random=3',
    // Children, Treatment, Sedation
    specialties: ['s3', 's4', 's5']
  }
];

export const TEXTS: Translations = {
  headerTitle: { [Language.EN]: 'Book Appointment', [Language.LV]: 'Pieteikt Vizīti', [Language.RU]: 'Записаться' },
  stepService: { [Language.EN]: 'Service', [Language.LV]: 'Pakalpojums', [Language.RU]: 'Услуга' },
  stepDate: { [Language.EN]: 'Date & Time', [Language.LV]: 'Datums un Laiks', [Language.RU]: 'Дата и время' },
  stepDetails: { [Language.EN]: 'Details', [Language.LV]: 'Dati', [Language.RU]: 'Детали' },
  stepPayment: { [Language.EN]: 'Payment', [Language.LV]: 'Maksājums', [Language.RU]: 'Оплата' },
  next: { [Language.EN]: 'Next Step', [Language.LV]: 'Tālāk', [Language.RU]: 'Далее' },
  back: { [Language.EN]: 'Back', [Language.LV]: 'Atpakaļ', [Language.RU]: 'Назад' },
  selectService: { [Language.EN]: 'Select a Service', [Language.LV]: 'Izvēlieties pakalpojumu', [Language.RU]: 'Выберите услугу' },
  selectSpecialist: { [Language.EN]: 'Select a Specialist', [Language.LV]: 'Izvēlieties speciālistu', [Language.RU]: 'Выберите специалиста' },
  anySpecialist: { [Language.EN]: 'Any Available Specialist', [Language.LV]: 'Jebkurš pieejams speciālists', [Language.RU]: 'Любой доступный специалист' },
  morning: { [Language.EN]: 'Morning', [Language.LV]: 'Rīts', [Language.RU]: 'Утро' },
  afternoon: { [Language.EN]: 'Afternoon', [Language.LV]: 'Pēcpusdiena', [Language.RU]: 'День' },
  personalInfo: { [Language.EN]: 'Patient Information', [Language.LV]: 'Pacienta informācija', [Language.RU]: 'Информация о пациенте' },
  firstName: { [Language.EN]: 'First Name', [Language.LV]: 'Vārds', [Language.RU]: 'Имя' },
  lastName: { [Language.EN]: 'Last Name', [Language.LV]: 'Uzvārds', [Language.RU]: 'Фамилия' },
  email: { [Language.EN]: 'Email', [Language.LV]: 'E-pasts', [Language.RU]: 'Эл. почта' },
  phone: { [Language.EN]: 'Phone Number', [Language.LV]: 'Tālruņa numurs', [Language.RU]: 'Номер телефона' },
  symptoms: { [Language.EN]: 'Describe your problem (optional)', [Language.LV]: 'Aprakstiet problēmu (neobligāti)', [Language.RU]: 'Опишите проблему (необязательно)' },
  aiHelp: { [Language.EN]: 'Use AI to suggest service', [Language.LV]: 'Izmantot AI ieteikumiem', [Language.RU]: 'Использовать ИИ' },
  uploadPhoto: { [Language.EN]: 'Upload photo (optional)', [Language.LV]: 'Augšupielādēt foto (neobligāti)', [Language.RU]: 'Загрузить фото (необязательно)' },
  gdprLabel: { [Language.EN]: 'I agree to the processing of my personal data according to the GDPR policy.', [Language.LV]: 'Piekrītu manu personas datu apstrādei saskaņā ar VDAR.', [Language.RU]: 'Я согласен на обработку персональных данных согласно GDPR.' },
  confirm: { [Language.EN]: 'Confirm Booking', [Language.LV]: 'Apstiprināt', [Language.RU]: 'Подтвердить' },
  deposit: { [Language.EN]: 'Reservation Deposit', [Language.LV]: 'Rezervācijas iemaksa', [Language.RU]: 'Депозит' },
  total: { [Language.EN]: 'Total Estimated', [Language.LV]: 'Kopā paredzēts', [Language.RU]: 'Всего' },
  paySecure: { [Language.EN]: 'Pay Securely', [Language.LV]: 'Drošs maksājums', [Language.RU]: 'Безопасная оплата' },
  successTitle: { [Language.EN]: 'Booking Confirmed!', [Language.LV]: 'Rezervācija apstiprināta!', [Language.RU]: 'Бронирование подтверждено!' },
  successMsg: { [Language.EN]: 'A confirmation email has been sent to you.', [Language.LV]: 'Apstiprinājuma e-pasts nosūtīts.', [Language.RU]: 'Письмо с подтверждением отправлено.' },
  addToCalendar: { [Language.EN]: 'Add to Calendar', [Language.LV]: 'Pievienot kalendāram', [Language.RU]: 'Добавить в календарь' },
  analyzing: { [Language.EN]: 'Analyzing...', [Language.LV]: 'Analizē...', [Language.RU]: 'Анализ...' },
};