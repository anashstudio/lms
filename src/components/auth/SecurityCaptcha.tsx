import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { RefreshCw, Volume2, ShieldCheck } from 'lucide-react';

export interface SecurityCaptchaRef {
  refresh: () => void;
  getCode: () => string;
  verify: (userInput: string) => boolean;
}

interface SecurityCaptchaProps {
  onCodeChange?: (code: string) => void;
  length?: number;
  className?: string;
}

export const SecurityCaptcha = forwardRef<SecurityCaptchaRef, SecurityCaptchaProps>(
  ({ onCodeChange, length = 5, className = '' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [captchaCode, setCaptchaCode] = useState<string>('');
    const [isSpinning, setIsSpinning] = useState(false);

    // تولید کدهای ضد جعل غیر قابل تشخیص توسط OCR ساده
    const generateCode = (len: number = 5): string => {
      // استفاده از کاراکترهای کاملاً خوانا و غیر مبهم
      const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const drawCaptcha = (code: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // پس‌زمینه با گرادیانت امنیتی
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#f1f5f9');
      bgGradient.addColorStop(0.5, '#e2e8f0');
      bgGradient.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // رسم خطوط نویز ضد ربات (Anti-Bot Interference Lines)
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 200)}, 0.45)`;
        ctx.lineWidth = 1.2 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.bezierCurveTo(
          Math.random() * width, Math.random() * height,
          Math.random() * width, Math.random() * height,
          Math.random() * width, Math.random() * height
        );
        ctx.stroke();
      }

      // رسم نقاط نویز (Salt & Pepper Noise Dots)
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.6)`;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // رسم حروف با زاویه تصادفی، فونت متنوع و اعوجاج
      const charWidth = (width - 24) / code.length;
      const fonts = ['bold 22px Arial', 'bold 24px Verdana', 'bold 23px Tahoma', 'bold 25px Georgia'];
      const colors = ['#0f172a', '#1e3a8a', '#0369a1', '#047857', '#b91c1c', '#4338ca'];

      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        ctx.save();

        const x = 16 + i * charWidth + (Math.random() * 6 - 3);
        const y = height / 2 + 7 + (Math.random() * 6 - 3);
        const angle = (Math.random() * 36 - 18) * (Math.PI / 180);

        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;

        ctx.fillText(char, -8, 0);
        ctx.restore();
      }
    };

    const refresh = () => {
      setIsSpinning(true);
      const newCode = generateCode(length);
      setCaptchaCode(newCode);
      drawCaptcha(newCode);
      if (onCodeChange) {
        onCodeChange(newCode);
      }
      setTimeout(() => setIsSpinning(false), 500);
    };

    useImperativeHandle(ref, () => ({
      refresh,
      getCode: () => captchaCode,
      verify: (input: string) => {
        if (!input || !captchaCode) return false;
        return input.trim().toUpperCase() === captchaCode.toUpperCase();
      }
    }));

    useEffect(() => {
      refresh();
    }, [length]);

    // قابلیت خواندن صوتی کپچا برای دسترس‌پذیری سازمانی (Accessibility)
    const speakCaptcha = () => {
      if ('speechSynthesis' in window && captchaCode) {
        // تلفظ کاراکترها به صورت تک‌تک
        const utterance = new SpeechSynthesisUtterance(captchaCode.split('').join(' '));
        utterance.rate = 0.8;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    };

    return (
      <div className={`flex items-center gap-2 select-none ${className}`}>
        <div className="relative border border-slate-300 rounded-lg overflow-hidden shadow-inner bg-slate-100 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={145}
            height={42}
            className="block cursor-pointer"
            onClick={refresh}
            title="برای تغییر کد کلیک کنید"
          />
          <div className="absolute top-0.5 right-0.5 pointer-events-none opacity-40">
            <ShieldCheck className="w-3 h-3 text-slate-500" />
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          title="بارگذاری مجدد کد امنیتی"
          className="p-2 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200 transition-all active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin text-sky-600' : ''}`} />
        </button>

        <button
          type="button"
          onClick={speakCaptcha}
          title="پخش صوتی کد امنیتی"
          className="p-2 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-all active:scale-95"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    );
  }
);

SecurityCaptcha.displayName = 'SecurityCaptcha';
