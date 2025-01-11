import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Props 타입 정의
interface UserInput {
  name: string;
  birthday: string;
  absentYear: string;
  absentMonth: string;
  absentDay: string;
  absentTime: number; // 0: 오전, 1: 오후, 2: 종일
  absentCategory: number; // 0: 공가, 1: 사유
  absentReason: string;
  absentDetail: string;
  absentPlace: string;
  signatureUrl: string;
  pictureUrl: string[];
  campus: string;
  class: string;
}

interface AttendancePreviewProps {
  userInput: UserInput;
}

const AttendancePreview: React.FC<AttendancePreviewProps> = () => {
  const today = new Date();
  const currentYear = String(today.getFullYear()).slice(2, 4); // 연도
  const currentMonth = String(today.getMonth()); // 월 (0부터 시작하므로 +1 필요)
  const currentDay = String(today.getDate()).padStart(2, "0"); // 일
  const currentDate = {
    currentYear: currentYear,
    currentMonth: currentMonth,
    currentDay: currentDay,
  };

  const userInput = {
    name: "홍길동",
    birthday: "1995-05-15",
    absentYear: "25",
    absentMonth: "01",
    absentDay: "11",
    absentTime: 1, // 0: 오전, 1: 오후, 2: 종일

    absentCategory: 0, // 0: 공가, 1: 사유
    absentReason: "병원 방문\n가족 치료", // 괄호안 내용

    absentDetail: "서울 종합병원\n2시간 진료", // 세부내용
    absentPlace: "서울 강남구",
    signatureUrl: "/체크.png",

    campus: "서울 캠퍼스",
    class: "3학년 1반",
  };

  const docsImageUrls = ["/소명확인서.png", "/소명확인서-별첨.png"];

  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const [fontStyleOne, setFontStyleOne] = useState<string>(""); // 본문 전부
  const [fontStyleTwo, setFontStyleTwo] = useState<string>(""); //마지막 날짜 글씨 사이즈

  const fontStyleTwoCoordinate: Record<string, [number, number]> = {
    currentYear: [0.38, 0.36],
    currentMonth: [0.485, 0.836],
    currentDay: [0.585, 0.836],
  };

  const fontStyleOneCoordinate: Record<string, [number, number]> = {
    name: [0.32, 0.2293],
    birthday: [0.66, 0.229],
    absentYear: [0.352, 0.273],
    absentMonth: [0.45, 0.273],
    absentDay: [0.53, 0.273],
    absentPlace: [0.345, 0.551],
    signature: [0.85, 0.66],
    absentName: [0.35, 0.66],
  };
  const absentTime = [
    [0.6075, 0.26],
    [0.7, 0.26],
    [0.7915, 0.26],
  ];

  useEffect(() => {
    const finalInnerWidth = window.innerWidth;
    const finalInnerHeight = (window.innerWidth * 4) / 3;

    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current;
    if (!canvas1 || !canvas2) return;
    const ctx1 = canvas1.getContext("2d");
    const ctx2 = canvas2.getContext("2d");

    if (!ctx1 || !ctx2) return;

    const checkSize = canvas1.width * 0.018;

    canvas1.width = 1260; // final
    canvas1.height = 1782;

    canvas2.width = finalInnerWidth;
    canvas2.height = finalInnerHeight;

    const docsImg1 = new Image();
    docsImg1.src = docsImageUrls[0]; // 이미지 URL

    setFontStyleOne(`bold 20px serif`);
    setFontStyleTwo(`bold 20px serif`);
    const absentTimeCoord = absentTime[userInput.absentTime];

    const imgCheck = new Image();
    imgCheck.src = "/체크.png";

    const signatureImage = new Image();
    signatureImage.src = userInput.signatureUrl;

    docsImg1.onload = () => {
      ctx1.drawImage(docsImg1, 0, 0, canvas1.width, canvas1.height);
      ctx1.font = fontStyleOne;

      // 세부내용
      Object.keys(fontStyleOneCoordinate).forEach((key) => {
        console.log("?", key);
        const coord = fontStyleOneCoordinate[key];
        const value = userInput[key as keyof UserInput] || "";
        ctx1.fillText(
          value as string,
          coord[0] * canvas1.width,
          coord[1] * canvas1.height
        );
      });

      // 마지막 날짜
      ctx1.font = fontStyleTwo;
      Object.keys(fontStyleTwoCoordinate).forEach((key) => {
        const coord = fontStyleTwoCoordinate[key];
        const value = currentDate[key] || "";
        ctx1.fillText(
          value as string,
          coord[0] * canvas1.width,
          coord[1] * canvas1.height
        );
      });
      ctx1.fillText(
        userInput[name],
        fontStyleOneCoordinate.absentName[0] * canvas1.width,
        fontStyleOneCoordinate.absentName[1] * canvas1.height
      );
      // birthday: [0.66, 0.229], 836 575

      ctx1.drawImage(
        signatureImage,
        fontStyleOneCoordinate.signature[0] * canvas1.width,
        fontStyleOneCoordinate.signature[1] * canvas1.height,
        0.07 * window.innerWidth,
        0.035 * ((window.innerWidth * 4) / 3)
      );
      ctx1.drawImage(
        imgCheck,
        absentTimeCoord[0] * canvas1.width,
        absentTimeCoord[1] * canvas1.height,
        checkSize,
        checkSize
      );
    };

    const img2 = new Image();
    img2.src = docsImageUrls[1]; // 두 번째 캔버스 이미지 URL
    img2.onload = () => {
      ctx2.drawImage(img2, 0, 0, canvas2.width, canvas2.height);
    };
  }, [userInput, fontStyleOne, fontStyleTwo]);

  const saveImg = () => {
    if (!canvas1Ref.current || !canvas2Ref.current) return;

    html2canvas(canvas1Ref.current).then(() => {
      const canvas = canvas1Ref.current;
      if (!canvas) console.log("ㅋ");
      const imgData = canvas!.toDataURL("image/png", 1.0); // 임시 !
      const imgWidth = 210;
      const imgHeight = 297;
      const doc = new jsPDF("p", "mm", "a4");

      doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      doc.addPage();
      // 임시 ! 처리
      // doc.addImage(
      //   canvas2Ref.current!.toDataURL("image/png", 1.0),
      //   "PNG",
      //   0,
      //   0,
      //   imgWidth,
      //   imgHeight
      // );
      doc.save(
        `${userInput.absentYear}${userInput.absentMonth}${userInput.absentDay}_출결확인서_${userInput.name}.pdf`
      );
    });
  };

  return (
    <div id="preview">
      <div className="button-container-preview">
        <button className="make-button" onClick={saveImg}>
          PDF로 저장
        </button>
      </div>
      <canvas id="container" ref={canvas1Ref} />
      <canvas id="pictureContainer" ref={canvas2Ref} />
    </div>
  );
};

export default AttendancePreview;
