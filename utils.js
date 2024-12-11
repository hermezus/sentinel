export function log(message, color, url) {
    const getDate = () => {
        const now = new Date();

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    const colors = {
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        orange: '\x1b[31;1m'
    };

    const reset = '\x1b[0m';

    const colorCode = colors[color] || ``;

    console.log(`[${getDate()}] ${colorCode + message + reset} ${ url ? url : ""}`);
}

export function formatUSDT(value) {
    const usdtValue = Number(value) / 1000000;
    const roundedValue = usdtValue.toFixed(2);

    return roundedValue;
}