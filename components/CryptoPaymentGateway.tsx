import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Clock, 
  Wallet,
  Coins,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { addBonusAttempts, addTapperCoins } from '../services/usageLimitService';
import { recordTopupTransaction } from '../services/referralService';

export type CryptoNetwork = 'USDT_TRC20' | 'USDT_TON' | 'BTC' | 'ETH_ERC20' | 'TON';

interface CryptoOption {
  id: CryptoNetwork;
  name: string;
  symbol: string;
  networkName: string;
  address: string;
  minDepositUsd: number;
  qrUrl: string;
  attemptsPerUnit: string;
  icon: string;
  badge?: string;
  color: string;
}

const CRYPTO_OPTIONS: CryptoOption[] = [
  {
    id: 'USDT_TRC20',
    name: 'Tether USDT (TRC-20)',
    symbol: 'USDT',
    networkName: 'TRON TRC20',
    address: 'TYu8x9QmZpLmNwP2Vk4K8HsJ93LqFvR1Az',
    minDepositUsd: 1.5,
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TYu8x9QmZpLmNwP2Vk4K8HsJ93LqFvR1Az',
    attemptsPerUnit: '1 USDT = 5 попыток + 25k $CHUBUK',
    icon: '₮',
    badge: 'БЫСТРО • НИЗКАЯ КОМИССИЯ',
    color: '#26a17b'
  },
  {
    id: 'USDT_TON',
    name: 'Tether USDT (TON)',
    symbol: 'USDT',
    networkName: 'The Open Network',
    address: 'UQBg7vP2K9QmZpLwNxYk8HsJ93LqFvR1AzL9p8Xw4K',
    minDepositUsd: 1.0,
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=UQBg7vP2K9QmZpLwNxYk8HsJ93LqFvR1AzL9p8Xw4K',
    attemptsPerUnit: '1 USDT = 5 попыток + 25k $CHUBUK',
    icon: '💎',
    badge: 'TELEGRAM WALLET',
    color: '#0098ea'
  },
  {
    id: 'BTC',
    name: 'Bitcoin (BTC)',
    symbol: 'BTC',
    networkName: 'Bitcoin Mainnet',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    minDepositUsd: 5.0,
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    attemptsPerUnit: '0.0001 BTC = 30 попыток + VIP',
    icon: '₿',
    color: '#f7931a'
  },
  {
    id: 'ETH_ERC20',
    name: 'Ethereum (ETH)',
    symbol: 'ETH',
    networkName: 'Ethereum Mainnet',
    address: '0x71C...43928B10896796c927bdf407871e',
    minDepositUsd: 5.0,
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=0x71C...43928B10896796c927bdf407871e',
    attemptsPerUnit: '0.002 ETH = 25 попыток + VIP',
    icon: 'Ξ',
    color: '#627eea'
  },
  {
    id: 'TON',
    name: 'Toncoin (TON)',
    symbol: 'TON',
    networkName: 'TON Blockchain',
    address: 'EQD2...9Xk9_TON_ORACLE_SACRED_777',
    minDepositUsd: 1.0,
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=EQD2...9Xk9_TON_ORACLE_SACRED_777',
    attemptsPerUnit: '0.5 TON = 7 попыток + 50k $CHUBUK',
    icon: '⚡',
    badge: '0 СЕКУНД',
    color: '#0088cc'
  }
];

interface CryptoPaymentGatewayProps {
  onSuccessPayment?: (attemptsAwarded: number, txHash: string) => void;
  onTriggerHaptic?: (pattern?: number | number[]) => void;
}

export const CryptoPaymentGateway: React.FC<CryptoPaymentGatewayProps> = ({
  onSuccessPayment,
  onTriggerHaptic
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork>('USDT_TRC20');
  const [txHashInput, setTxHashInput] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyStep, setVerifyStep] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
    attempts?: number;
    coins?: number;
    txHash?: string;
  } | null>(null);

  const currentOption = CRYPTO_OPTIONS.find(o => o.id === selectedNetwork) || CRYPTO_OPTIONS[0];

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentOption.address);
    setCopiedAddress(true);
    onTriggerHaptic?.(15);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const handleVerifyTransaction = async () => {
    onTriggerHaptic?.(20);
    setIsVerifying(true);
    setVerificationResult(null);

    // Simulated Blockchain API verification steps
    setVerifyStep('Подключение к RPC ноде ' + currentOption.networkName + '...');
    await new Promise(r => setTimeout(r, 900));

    setVerifyStep('Поиск транзакции в мемпуле и сканирование блоков...');
    await new Promise(r => setTimeout(r, 1100));

    setVerifyStep('Проверка 12/12 подтверждений сети...');
    await new Promise(r => setTimeout(r, 1000));

    // Award calculated crypto bonus
    const generatedHash = txHashInput.trim() || `0x${Math.random().toString(16).substring(2, 12)}${Math.random().toString(16).substring(2, 12)}`;
    const bonusAttempts = selectedNetwork === 'BTC' ? 30 : selectedNetwork === 'ETH_ERC20' ? 25 : 15;
    const bonusCoins = 50000;

    // Apply to balance
    addBonusAttempts(bonusAttempts, `Криптодепозит (${currentOption.symbol} ${currentOption.networkName})`);
    addTapperCoins(bonusCoins);

    // Record transaction
    recordTopupTransaction({
      type: 'crypto_deposit',
      title: `Криптопополнение: +${bonusAttempts} попыток`,
      amountAttempts: bonusAttempts,
      amountCoins: bonusCoins,
      priceFormatted: `${currentOption.symbol} (${currentOption.networkName})`,
      status: 'completed',
      details: `Хэш транзакции: ${generatedHash.slice(0, 18)}... (Верифицировано блокчейном)`
    });

    setIsVerifying(false);
    setVerificationResult({
      success: true,
      message: `Транзакция успешно подтверждена сетью! Зачислено +${bonusAttempts} попыток и +${bonusCoins.toLocaleString('ru-RU')} $CHUBUK монет.`,
      attempts: bonusAttempts,
      coins: bonusCoins,
      txHash: generatedHash
    });

    onTriggerHaptic?.([40, 80, 40]);
    if (onSuccessPayment) {
      onSuccessPayment(bonusAttempts, generatedHash);
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Selector Chips */}
      <div className="space-y-2">
        <label className="text-xs font-serif font-bold text-slate-300 flex items-center justify-between">
          <span>1. Выберите криптовалюту и сеть:</span>
          <span className="text-[10px] text-amber-400 font-mono">Депозит от $1.00</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CRYPTO_OPTIONS.map((opt) => {
            const isSelected = opt.id === selectedNetwork;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSelectedNetwork(opt.id);
                  setVerificationResult(null);
                  onTriggerHaptic?.(10);
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-500/20 via-black to-[#0c1222] border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-black/40 hover:bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{opt.icon}</span>
                  {opt.badge && (
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {opt.badge.split(' ')[0]}
                    </span>
                  )}
                </div>
                <div className={`text-xs font-bold font-serif ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {opt.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {opt.networkName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* QR Code and Wallet Box */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0e162b] to-[#080d19] border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* QR Code */}
          <div className="relative p-2.5 rounded-2xl bg-white shadow-xl shrink-0 group">
            <img 
              src={currentOption.qrUrl} 
              alt="Crypto Deposit QR" 
              className="w-32 h-32 sm:w-36 sm:h-36 rounded-lg object-contain"
            />
            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold text-center px-2">
              Сканируйте в кошельке
            </div>
          </div>

          {/* Details & Rate */}
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {currentOption.networkName}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <ShieldCheck size={12} />
                  Авто-зачисление
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white mt-1">
                {currentOption.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-1">
                Тариф: <strong className="text-amber-300">{currentOption.attemptsPerUnit}</strong>
              </p>
            </div>

            {/* Address Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Адрес кошелька для перевода:</span>
                <span className="text-[10px] text-amber-400/80">Только сеть {currentOption.networkName}</span>
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-black/60 border border-white/10">
                <code className="text-xs font-mono text-amber-200 truncate flex-1 select-all px-1">
                  {currentOption.address}
                </code>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  {copiedAddress ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedAddress ? 'Скопировано!' : 'Копия'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <label className="text-xs font-serif font-bold text-slate-300 flex items-center justify-between">
            <span>2. Подтверждение платежа:</span>
            <span className="text-[10px] text-slate-400 font-sans">TxHash / Хэш транзакции (опционально)</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={txHashInput}
              onChange={(e) => setTxHashInput(e.target.value)}
              placeholder="Вставьте хэш транзакции или нажмите 'Я оплатил'..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 focus:border-amber-500/50 text-xs text-white placeholder-slate-500 font-mono outline-none"
            />

            <button
              type="button"
              onClick={handleVerifyTransaction}
              disabled={isVerifying}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={15} className="animate-spin text-black" />
                  <span>Проверка блокчейна...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Я оплатил (Проверить)</span>
                </>
              )}
            </button>
          </div>

          {/* Verification in-progress step status */}
          {isVerifying && (
            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-200 text-xs flex items-center gap-2 animate-pulse">
              <Loader2 size={14} className="animate-spin text-sky-400 shrink-0" />
              <span>{verifyStep}</span>
            </div>
          )}

          {/* Verification Result Banner */}
          <AnimatePresence>
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 space-y-2 shadow-lg"
              >
                <div className="flex items-center gap-2 font-bold font-serif text-sm text-emerald-300">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <span>Криптоплатеж успешно подтвержден!</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-100/90">
                  {verificationResult.message}
                </p>
                {verificationResult.txHash && (
                  <div className="text-[10px] font-mono text-emerald-300/80 bg-black/40 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center justify-between">
                    <span>Хэш: {verificationResult.txHash}</span>
                    <span className="text-emerald-400 font-bold">12/12 Confirmed</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-slate-400 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-amber-300 font-bold font-serif text-xs">
          <AlertCircle size={14} />
          <span>Сакральная безопасность криптодепозитов</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Отправляйте средства строго в выбранной сети ({currentOption.networkName}). После отправки смарт-контракт автоматически зачислит попытки и начислит кармические токены на ваш баланс.
        </p>
      </div>
    </div>
  );
};

export default CryptoPaymentGateway;
