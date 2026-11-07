import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { THEME_CONFIGS } from '../../utils/theme';
import {
  Terminal,
  Database,
  Copy,
  Check,
  Play,
  Table,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Code2
} from 'lucide-react';

export const SQLConsole: React.FC = () => {
  const { settings, activeRole, setIsSetupModalOpen, setActiveView, triggerRefresh } = useApp();
  const theme = THEME_CONFIGS[settings.theme_color] || THEME_CONFIGS.emerald;

  const [query, setQuery] = useState('SELECT * FROM users;');
  const [result, setResult] = useState<{ columns: string[]; rows: any[][]; message?: string; error?: string } | null>(() => {
    return db.executeSQL('SELECT * FROM users;');
  });
  const [selectedTable, setSelectedTable] = useState<string>('users');

  if (activeRole !== 'super_admin') {
    return (
      <div className="bg-white border border-rose-200 rounded-xl p-8 text-center max-w-lg mx-auto my-12">
        <p className="text-xs text-slate-600">کنسول SQL منحصراً در دسترس مدیر ارشد سامانه است.</p>
      </div>
    );
  }

  const tables = db.getTableNames();

  const handleExecute = () => {
    const res = db.executeSQL(query);
    setResult(res);
  };

  const handleSelectTable = (tbl: string) => {
    setSelectedTable(tbl);
    const sql = `SELECT * FROM ${tbl};`;
    setQuery(sql);
    const res = db.executeSQL(sql);
    setResult(res);
  };

  const [copiedDump, setCopiedDump] = useState(false);

  const handleCopySQLDump = () => {
    const dump = db.exportFullSQLDump();
    navigator.clipboard.writeText(dump);
    setCopiedDump(true);
    setTimeout(() => setCopiedDump(false), 2500);
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-900">
              کنسول پایگاه‌داده رابطه‌ای SQL و ساختار جداول
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            موتور رابطه‌ای: {settings.db_engine} · اجرای کوئری زنده و خروجی اسکریپت SQL Dump جهت استقرار در سرور
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">

          <button
            onClick={() => setIsSetupModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>ویزارد نصب محلی</span>
          </button>

          <button
            onClick={handleCopySQLDump}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            {copiedDump ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedDump ? 'کپی شد' : 'کپی کامل SQL Dump'}</span>
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
            <Database className="w-4 h-4 text-slate-500" />
            <span>جداول رابطه‌ای ({tables.length})</span>
          </h3>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm divide-y divide-slate-100 text-xs">
            {tables.map(tbl => {
              const isSelected = selectedTable === tbl;
              return (
                <button
                  key={tbl}
                  onClick={() => handleSelectTable(tbl)}
                  className={`w-full text-right px-3.5 py-2.5 flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold border-r-2 border-emerald-600'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-mono">{tbl}</span>
                  <Table className="w-3.5 h-3.5 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div><strong>توسعه‌پذیری:</strong> تمامی جداول نرمال‌سازی شده و کدهای DDL در فایل <code className="font-mono text-slate-700">src/db/schema.sql</code> موجودند.</div>
          </div>
        </div>

        {}
        <div className="lg:col-span-3 space-y-4">
          {}
          <div className="bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-800 text-xs space-y-3">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1 font-mono">
                <Code2 className="w-3.5 h-3.5" />
                SQL Query Editor
              </span>
              <span>کلیدواژه‌های مجاز: SELECT, SHOW TABLES</span>
            </div>

            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-950 text-emerald-400 font-mono p-3 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              placeholder="دستور SQL را وارد کنید..."
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                مثال: <code className="text-emerald-400 font-mono">SHOW TABLES;</code> یا <code className="text-emerald-400 font-mono">SELECT * FROM courses;</code>
              </span>
              <button
                type="button"
                onClick={handleExecute}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>اجرای دستور SQL</span>
              </button>
            </div>
          </div>

          {}
          {result && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-xs space-y-2">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  {result.message || 'نتیجه اجرای کوئری:'}
                </span>
                {result.error && (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {result.error}
                  </span>
                )}
              </div>

              {!result.error && result.columns.length > 0 && (
                <div className="max-h-96 overflow-auto">
                  <table className="w-full text-right text-[11px]">
                    <thead className="bg-slate-100 text-slate-700 sticky top-0 font-mono">
                      <tr>
                        {result.columns.map((c, i) => (
                          <th key={i} className="py-2.5 px-3 border-b border-slate-200">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {result.rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2 px-3 text-slate-700 truncate max-w-xs">
                              {String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
