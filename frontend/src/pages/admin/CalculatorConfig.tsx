import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, Save, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { calculatorService, type PaperConfig, type CalculatorConfig } from '../../services/calculatorService';

const LIME = '#84CC16';
const LIME_DARK = '#65a30d';

const EMPTY_NEW_PAPER: PaperConfig = { paperName: '', paperSize: '', pricePerPage: 0 };

const DEFAULT_CONFIG: Omit<CalculatorConfig, '_id' | 'updatedBy' | 'updatedAt'> = {
  paperConfigs: [],
  mspPercent: 50,
  mrpPercent: 40,
  royaltyFromMrpPercent: 30,
  offlineExpensesPercent: 15,
  onlineExpensesPercent: 10,
  ebookRoyaltyPercent: 35,
  ebookOnlineExpensesPercent: 10,
  magazineRoyaltyOverride: null,
};

const inputCls =
  'w-full px-3 py-2.5 text-sm border rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all placeholder-neutral-400';

const labelCls = 'block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1';

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, title, description, children }) => (
  <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
    <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(132,204,22,0.12)' }}>
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">{title}</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const CalculatorConfigPage: React.FC = () => {
  const [config, setConfig] = useState<Omit<CalculatorConfig, '_id' | 'updatedBy' | 'updatedAt'>>(DEFAULT_CONFIG);

  /* Separate state for the "add new paper" input row — always starts empty */
  const [newPaper, setNewPaper] = useState<PaperConfig>({ ...EMPTY_NEW_PAPER });
  const [newPaperErrors, setNewPaperErrors] = useState<Partial<Record<keyof PaperConfig, string>>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await calculatorService.getAdminConfig();
        if (data) {
          setConfig({
            paperConfigs: data.paperConfigs ?? [],
            mspPercent: data.mspPercent,
            mrpPercent: data.mrpPercent,
            royaltyFromMrpPercent: data.royaltyFromMrpPercent,
            offlineExpensesPercent: data.offlineExpensesPercent,
            onlineExpensesPercent: data.onlineExpensesPercent,
            ebookRoyaltyPercent: data.ebookRoyaltyPercent,
            ebookOnlineExpensesPercent: data.ebookOnlineExpensesPercent,
            magazineRoyaltyOverride: data.magazineRoyaltyOverride,
          });
        }
      } catch {
        /* no config yet — use defaults */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Add paper: validate new row, push to list, clear inputs ── */
  const handleAddPaper = () => {
    const errs: Partial<Record<keyof PaperConfig, string>> = {};
    if (!newPaper.paperName.trim()) errs.paperName = 'Required';
    if (!newPaper.paperSize.trim()) errs.paperSize = 'Required';
    if (!newPaper.pricePerPage || newPaper.pricePerPage <= 0) errs.pricePerPage = 'Must be > 0';
    if (Object.keys(errs).length > 0) { setNewPaperErrors(errs); return; }

    setConfig((prev) => ({
      ...prev,
      paperConfigs: [...prev.paperConfigs, { ...newPaper }],
    }));
    setNewPaper({ ...EMPTY_NEW_PAPER });
    setNewPaperErrors({});
  };

  const removePaper = (index: number) =>
    setConfig((prev) => ({ ...prev, paperConfigs: prev.paperConfigs.filter((_, i) => i !== index) }));

  /* ── Numeric field helper ── */
  const setNum = (field: keyof typeof config, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value === '' ? '' : Number(value) }));
    setErrors((e) => { const n = { ...e }; delete n[field as string]; return n; });
  };

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (config.paperConfigs.length === 0) errs.paperConfigs = 'Add at least one paper configuration';
    const numFields: (keyof typeof config)[] = [
      'mspPercent', 'mrpPercent', 'royaltyFromMrpPercent',
      'offlineExpensesPercent', 'onlineExpensesPercent',
      'ebookRoyaltyPercent', 'ebookOnlineExpensesPercent',
    ];
    numFields.forEach((f) => {
      const v = config[f] as number;
      if (v === null || v === undefined || (v as any) === '' || isNaN(v)) errs[f as string] = 'Required';
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fix the errors before saving');
      return;
    }
    setSaving(true);
    try {
      await calculatorService.saveConfig({
        ...config,
        magazineRoyaltyOverride:
          config.magazineRoyaltyOverride === null || (config.magazineRoyaltyOverride as any) === ''
            ? null
            : Number(config.magazineRoyaltyOverride),
      });
      toast.success('Calculator configuration saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: LIME_DARK }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header — no save button here */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Calculator Configuration</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Configure royalty calculator parameters visible on the public landing page
        </p>
      </div>

      {/* Paper Configuration */}
      <SectionCard
        icon={<FileText className="w-5 h-5" style={{ color: LIME_DARK }} />}
        title="Paper Configuration"
        description="Define paper types, sizes, and per-page printing cost (used for Paperback & Magazine)"
      >
        <div className="space-y-4">
          {/* ── Saved papers list ── */}
          {config.paperConfigs.length > 0 && (
            <div className="space-y-2">
              <p className={labelCls}>Added Papers</p>
              {config.paperConfigs.map((paper, i) => (
                <div key={i}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-lime-50 dark:bg-lime-900/10 border border-lime-200 dark:border-lime-800/40">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-100">{paper.paperName}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600 dark:text-neutral-300">{paper.paperSize}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600 dark:text-neutral-300">Rs {paper.pricePerPage}/page</span>
                  </div>
                  <button onClick={() => removePaper(i)}
                    className="p-1.5 rounded-md text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.paperConfigs && (
            <p className="text-xs text-red-500">{errors.paperConfigs}</p>
          )}

          {/* ── New paper input row — always empty ── */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700">
            <p className={`${labelCls} mb-3`}>Add New Paper</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <input
                  type="text"
                  value={newPaper.paperName}
                  onChange={(e) => { setNewPaper((p) => ({ ...p, paperName: e.target.value })); setNewPaperErrors((e) => ({ ...e, paperName: undefined })); }}
                  placeholder="Paper Name (e.g. Regular)"
                  className={`${inputCls} ${newPaperErrors.paperName ? 'border-red-400' : ''}`}
                />
                {newPaperErrors.paperName && <p className="text-xs text-red-500 mt-0.5">{newPaperErrors.paperName}</p>}
              </div>
              <div>
                <input
                  type="text"
                  value={newPaper.paperSize}
                  onChange={(e) => { setNewPaper((p) => ({ ...p, paperSize: e.target.value })); setNewPaperErrors((e) => ({ ...e, paperSize: undefined })); }}
                  placeholder="Paper Size (e.g. A4, A5)"
                  className={`${inputCls} ${newPaperErrors.paperSize ? 'border-red-400' : ''}`}
                />
                {newPaperErrors.paperSize && <p className="text-xs text-red-500 mt-0.5">{newPaperErrors.paperSize}</p>}
              </div>
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPaper.pricePerPage || ''}
                  onChange={(e) => { setNewPaper((p) => ({ ...p, pricePerPage: parseFloat(e.target.value) || 0 })); setNewPaperErrors((e) => ({ ...e, pricePerPage: undefined })); }}
                  placeholder="Price Per Page (Rs)"
                  className={`${inputCls} ${newPaperErrors.pricePerPage ? 'border-red-400' : ''}`}
                />
                {newPaperErrors.pricePerPage && <p className="text-xs text-red-500 mt-0.5">{newPaperErrors.pricePerPage}</p>}
              </div>
            </div>
            <button
              onClick={handleAddPaper}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border-2 border-dashed border-lime-300 dark:border-lime-700 text-lime-700 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/10 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Paper
            </button>
          </div>
        </div>
      </SectionCard>

      {/* Pricing Rules — Paperback */}
      <SectionCard
        icon={<Calculator className="w-5 h-5" style={{ color: LIME_DARK }} />}
        title="Pricing Rules — Paperback & Magazine"
        description="Percentage-based rules for calculating MSP, MRP, and author royalty"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { field: 'mspPercent' as const,             label: 'Minimum Selling Price (MSP) %', hint: 'Markup over Printing Cost' },
            { field: 'mrpPercent' as const,             label: 'Book MRP %',                    hint: 'MRP must be this % above MSP' },
            { field: 'royaltyFromMrpPercent' as const,  label: 'Royalty from MRP %',            hint: 'Author royalty as % of MRP' },
            { field: 'offlineExpensesPercent' as const, label: 'Offline Selling Expenses %',    hint: 'Deducted from royalty for offline' },
            { field: 'onlineExpensesPercent' as const,  label: 'Online Selling Expenses %',     hint: 'Deducted from royalty for online' },
          ].map(({ field, label, hint }) => (
            <div key={field}>
              <label className={labelCls}>{label}</label>
              <input
                type="number" min="0" max="100" step="0.1"
                value={config[field] as number}
                onChange={(e) => setNum(field, e.target.value)}
                placeholder="0"
                className={`${inputCls} ${errors[field] ? 'border-red-400' : ''}`}
              />
              <p className="text-xs text-neutral-400 mt-0.5">{hint}</p>
              {errors[field] && <p className="text-xs text-red-500 mt-0.5">{errors[field]}</p>}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* E-Book Config */}
      <SectionCard
        icon={<FileText className="w-5 h-5" style={{ color: LIME_DARK }} />}
        title="E-Book Configuration"
        description="Royalty and expense rules specific to digital books"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelCls}>Royalty from MRP % (E-Book)</label>
            <input
              type="number" min="0" max="100" step="0.1"
              value={config.ebookRoyaltyPercent}
              onChange={(e) => setNum('ebookRoyaltyPercent', e.target.value)}
              placeholder="35"
              className={`${inputCls} ${errors.ebookRoyaltyPercent ? 'border-red-400' : ''}`}
            />
            {errors.ebookRoyaltyPercent && <p className="text-xs text-red-500 mt-0.5">{errors.ebookRoyaltyPercent}</p>}
          </div>
          <div>
            <label className={labelCls}>Online Selling Expenses % (E-Book)</label>
            <input
              type="number" min="0" max="100" step="0.1"
              value={config.ebookOnlineExpensesPercent}
              onChange={(e) => setNum('ebookOnlineExpensesPercent', e.target.value)}
              placeholder="10"
              className={`${inputCls} ${errors.ebookOnlineExpensesPercent ? 'border-red-400' : ''}`}
            />
            {errors.ebookOnlineExpensesPercent && <p className="text-xs text-red-500 mt-0.5">{errors.ebookOnlineExpensesPercent}</p>}
          </div>
        </div>
      </SectionCard>

      {/* Magazine Override */}
      <SectionCard
        icon={<FileText className="w-5 h-5" style={{ color: LIME_DARK }} />}
        title="Magazine Override (Optional)"
        description="Leave blank to use the same royalty % as Paperback"
      >
        <div className="max-w-xs">
          <label className={labelCls}>Override Royalty from MRP % (Magazine)</label>
          <input
            type="number" min="0" max="100" step="0.1"
            value={config.magazineRoyaltyOverride ?? ''}
            onChange={(e) =>
              setConfig((prev) => ({
                ...prev,
                magazineRoyaltyOverride: e.target.value === '' ? null : Number(e.target.value),
              }))
            }
            placeholder={`Default: ${config.royaltyFromMrpPercent}% (same as Paperback)`}
            className={inputCls}
          />
          <p className="text-xs text-neutral-400 mt-0.5">
            Optional. If set, magazine uses this royalty %; otherwise uses Paperback value.
          </p>
        </div>
      </SectionCard>

      {/* Single save button at bottom */}
      <div className="flex justify-end pb-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${LIME}, ${LIME_DARK})` }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save & Submit'}
        </button>
      </div>
    </div>
  );
};

export default CalculatorConfigPage;
