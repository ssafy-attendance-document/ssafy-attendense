import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface UserInput {
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
  pictureUrl: string[];
  campus: string;
  class: string;
}

interface AttendancePreviewProps {
  userInput: UserInput;
}

const AttendancePreview: React.FC<AttendancePreviewProps> = () => {
  const today = new Date();
  const currentYear = String(today.getFullYear()).slice(2, 4);
  const currentMonth = String(today.getMonth());
  const currentDay = String(today.getDate()).padStart(2, "0");
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
    absentTime: 1,
    absentCategory: 0,
    absentReason: "병원 방문\n가족 치료",
    absentDetail: "서울 종합병원\n2시간 진료",
    absentPlace: "서울 강남구",
    signatureUrl: "/체크.png",
    campus: "서울 캠퍼스",
    class: "3학년 1반",
  };

  const docsImageUrls = ["/소명확인서.png", "/소명확인서-별첨.png"];

  const canvas1Ref = useRef<HTMLCanvasElement | null>(null);
  const canvas2Ref = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fontStyleOne, setFontStyleOne] = useState<string>("");
  const [fontStyleTwo, setFontStyleTwo] = useState<string>("");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // A4 비율 유지를 위한 상수
  const A4_RATIO = 1.4142; // A4 height/width ratio

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

  // 화면 크기 변경 감지 및 캔버스 크기 조정
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerWidth * A4_RATIO;
        setCanvasSize({
          width: containerWidth,
          height: containerHeight,
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  useEffect(() => {
    if (!canvasSize.width || !canvasSize.height) return;

    const canvas1 = canvas1Ref.current;
    const canvas2 = canvas2Ref.current;
    if (!canvas1 || !canvas2) return;

    const ctx1 = canvas1.getContext("2d");
    const ctx2 = canvas2.getContext("2d");
    if (!ctx1 || !ctx2) return;

    // 캔버스 크기 설정
    canvas1.width = canvasSize.width * 2; // 고해상도를 위해 2배 크기로 설정
    canvas1.height = canvasSize.height * 2;
    canvas1.style.width = `${canvasSize.width}px`;
    canvas1.style.height = `${canvasSize.height}px`;

    canvas2.width = canvasSize.width * 2;
    canvas2.height = canvasSize.height * 2;
    canvas2.style.width = `${canvasSize.width}px`;
    canvas2.style.height = `${canvasSize.height}px`;

    // 컨텍스트 설정
    ctx1.scale(2, 2); // 고해상도 대응
    ctx2.scale(2, 2);

    const checkSize = canvas1.width * 0.018;

    const fontSize = Math.max(canvasSize.width * 0.02, 12); // 최소 폰트 크기 설정
    setFontStyleOne(`bold ${fontSize}px serif`);
    setFontStyleTwo(`bold ${fontSize}px serif`);

    const docsImg1 = new Image();
    docsImg1.src = docsImageUrls[0];

    const imgCheck = new Image();
    imgCheck.src = "/체크.png";

    const signatureImage = new Image();
    signatureImage.src = userInput.signatureUrl;

    docsImg1.onload = () => {
      ctx1.drawImage(docsImg1, 0, 0, canvasSize.width, canvasSize.height);
      ctx1.font = fontStyleOne;

      // 텍스트 렌더링
      Object.keys(fontStyleOneCoordinate).forEach((key) => {
        const coord = fontStyleOneCoordinate[key];
        const value = userInput[key as keyof UserInput] || "";
        ctx1.fillText(
          value as string,
          coord[0] * canvasSize.width,
          coord[1] * canvasSize.height
        );
      });

      ctx1.font = fontStyleTwo;
      Object.keys(fontStyleTwoCoordinate).forEach((key) => {
        const coord = fontStyleTwoCoordinate[key];
        const value = currentDate[key as keyof typeof currentDate] || "";
        ctx1.fillText(
          value as string,
          coord[0] * canvasSize.width,
          coord[1] * canvasSize.height
        );
      });

      // 서명 이미지
      const signatureWidth = canvasSize.width * 0.07;
      const signatureHeight = canvasSize.height * 0.035;
      ctx1.drawImage(
        signatureImage,
        fontStyleOneCoordinate.signature[0] * canvasSize.width,
        fontStyleOneCoordinate.signature[1] * canvasSize.height,
        signatureWidth,
        signatureHeight
      );

      // 체크 마크
      const absentTimeCoord = absentTime[userInput.absentTime];
      ctx1.drawImage(
        imgCheck,
        absentTimeCoord[0] * canvasSize.width,
        absentTimeCoord[1] * canvasSize.height,
        checkSize / 2,
        checkSize / 2
      );
    };

    const img2 = new Image();
    img2.src = docsImageUrls[1];
    img2.onload = () => {
      ctx2.drawImage(img2, 0, 0, canvasSize.width, canvasSize.height);
    };
  }, [canvasSize, userInput, fontStyleOne, fontStyleTwo]);

  const saveImg = () => {
    if (!canvas1Ref.current || !canvas2Ref.current) return;

    html2canvas(canvas1Ref.current, {
      scale: 2, // 고해상도 PDF를 위한 스케일 설정
    }).then(() => {
      const canvas = canvas1Ref.current;
      if (!canvas) return;

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = 297;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.addPage();
      pdf.save(
        `${userInput.absentYear}${userInput.absentMonth}${userInput.absentDay}_출결확인서_${userInput.name}.pdf`
      );
    });
  };

  return (
    <div id="preview" ref={containerRef}>
      <div className="button-container-preview">
        <button className="make-button" onClick={saveImg}>
          PDF로 저장
        </button>
      </div>
      <div
        className="canvas-container"
        style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}
      >
        <canvas
          id="container"
          ref={canvas1Ref}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
          }}
        />
        <canvas
          id="pictureContainer"
          ref={canvas2Ref}
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            marginTop: "20px",
          }}
        />
      </div>
    </div>
  );
};

export default AttendancePreview;
