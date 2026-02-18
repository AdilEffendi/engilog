export const FLOOR_MAPPING: Record<number, string> = {
    1: "LG",
    2: "GF",
    3: "UG",
    4: "FF",
    5: "SF",
    6: "P4",
    7: "P5",
};

export const getFloorLabel = (floor: number | string | undefined): string => {
    const numFloor = Number(floor || 1);
    return FLOOR_MAPPING[numFloor] || floor?.toString() || "LG";
};

export const FLOOR_OPTIONS = Object.entries(FLOOR_MAPPING).map(([value, label]) => ({
    value: parseInt(value),
    label,
}));
