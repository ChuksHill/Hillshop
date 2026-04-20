const nairaFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export function formatNaira(amount: number) {
    return nairaFormatter.format(Number.isFinite(amount) ? amount : 0);
}
