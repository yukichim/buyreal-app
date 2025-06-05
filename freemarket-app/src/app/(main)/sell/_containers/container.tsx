"use client";

import type React from "react";

import { useState } from "react";
import { ProductCondition } from "~/server/domain/entities/product";
import SellProductPresenter from "./presentational";

/**
 *UIに関しては何もしない
 * @description Container/Presentationに基づき、値とロジックを保持
 * @returns
 */
export default function SellPageContainer() {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		condition: "",
		categoryId: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			alert("商品を出品しました！");
			setFormData({
				title: "",
				description: "",
				price: "",
				condition: "",
				categoryId: "",
			});
		} catch (error) {
			alert("出品に失敗しました");
		}
	};

	// フォームの入力値が変更されたときに呼ばれるハンドラ
	const handleFormChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
		name?: string,
	) => {
		if (typeof e === "string" && name) {
			// Selectコンポーネントからの変更の場合
			setFormData((prevData) => ({
				...prevData,
				[name]: e,
			}));
		} else if (typeof e !== "string" && "target" in e) {
			// InputやTextareaからの変更の場合
			const { name, value } = e.target;
			setFormData((prevData) => ({
				...prevData,
				[name]: value,
			}));
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-2xl font-bold text-gray-900">商品出品</h1>
						<a href="/" className="text-gray-600 hover:text-gray-900">
							ホームに戻る
						</a>
					</div>
				</div>
			</header>

			<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<SellProductPresenter
					formData={formData}
					onSubmit={handleSubmit}
					onFormChange={handleFormChange}
					productConditions={Object.values(ProductCondition)}
				/>
			</main>
		</div>
	);
}
