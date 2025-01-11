import { create } from "zustand";

interface TransformedData {
  name: string;
  birthday: string;
  absentYear: string;
  absentMonth: string;
  absentDay: string;
  absentTime: number;
  absentCategory: number;
  absentReason: string;
  absentDetail: string;
  absentPlace: string;
  signatureUrl: string;
  campus: string;
  class: string;
  appendix: File | null;
}

interface FormStore {
  formData: TransformedData;
  setFormData: (data: TransformedData) => void;
}

const initialState: TransformedData = {
  name: "",
  birthday: "",
  absentYear: "",
  absentMonth: "",
  absentDay: "",
  absentTime: 0,
  absentCategory: 0,
  absentReason: "",
  absentDetail: "",
  absentPlace: "",
  signatureUrl: "",
  campus: "",
  class: "",
  appendix: null,
};

export const useConfirmStore = create<FormStore>()((set) => ({
  formData: initialState,
  setFormData: (data) => set({ formData: data }),
}));
