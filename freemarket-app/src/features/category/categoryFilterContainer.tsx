"use client";

import { useState } from "react";

const categories = [
	{ id: "electrics", name: "家電・スマホ・カメラ" },
	{ id: "fashion", name: "ファッション" },
	{ id: "books", name: "本・音楽・ゲーム" },
	{ id: "sports", name: "スポーツ・レジャー" },
	{ id: "home", name: "インテリア・住まい" },
	{ id: "beauty", name: "コスメ・香水・美容" },
];

export function CategoryFilterContainer() {
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

	const handleCategoryChange = (categoryId: string, checked: boolean) => {
		if (checked) {
			setSelectedCategories([...selectedCategories, categoryId]);
		} else {
			setSelectedCategories;
		}
		console.log("選択されたカテゴリー：", selectedCategories);
	};

	return <></>;
}
