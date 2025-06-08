"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import { ProductCondition } from "~/domain/entities/product";
import { trpc } from "~/lib/trpc";

export default function SellPage() {
	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		condition: "",
		categoryId: "",
	});

	const createProductMutation = trpc.product.create.useMutation({
		onSuccess: () => {
			alert("商品を出品しました！");
			setFormData({
				title: "",
				description: "",
				price: "",
				condition: "",
				categoryId: "",
			});
		},
		onError: (error) => {
			alert(`出品に失敗しました: ${error.message}`);
		},
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		createProductMutation.mutate({
			title: formData.title,
			description: formData.description,
			price: Number.parseInt(formData.price),
			condition: formData.condition as ProductCondition,
			sellerId: "current-user",
			categoryId: formData.categoryId,
			images: ["/placeholder.svg?height=300&width=300"],
		});
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
				<Card>
					<CardHeader>
						<CardTitle>商品情報を入力</CardTitle>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							<div>
								<Label htmlFor="title">商品名</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									required
								/>
							</div>

							<div>
								<Label htmlFor="description">商品説明</Label>
								<Textarea
									id="description"
									value={formData.description}
									onChange={(e) =>
										setFormData({ ...formData, description: e.target.value })
									}
									rows={4}
									required
								/>
							</div>

							<div>
								<Label htmlFor="price">価格（円）</Label>
								<Input
									id="price"
									type="number"
									value={formData.price}
									onChange={(e) =>
										setFormData({ ...formData, price: e.target.value })
									}
									required
								/>
							</div>

							<div>
								<Label htmlFor="condition">商品の状態</Label>
								<Select
									value={formData.condition}
									onValueChange={(value) =>
										setFormData({ ...formData, condition: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="状態を選択" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={ProductCondition.NEW}>新品</SelectItem>
										<SelectItem value={ProductCondition.LIKE_NEW}>
											未使用に近い
										</SelectItem>
										<SelectItem value={ProductCondition.GOOD}>
											目立った傷や汚れなし
										</SelectItem>
										<SelectItem value={ProductCondition.FAIR}>
											やや傷や汚れあり
										</SelectItem>
										<SelectItem value={ProductCondition.POOR}>
											傷や汚れあり
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="category">カテゴリー</Label>
								<Select
									value={formData.categoryId}
									onValueChange={(value) =>
										setFormData({ ...formData, categoryId: value })
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="カテゴリーを選択" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="electronics">
											家電・スマホ・カメラ
										</SelectItem>
										<SelectItem value="fashion">ファッション</SelectItem>
										<SelectItem value="books">本・音楽・ゲーム</SelectItem>
										<SelectItem value="sports">スポーツ・レジャー</SelectItem>
										<SelectItem value="home">インテリア・住まい</SelectItem>
										<SelectItem value="beauty">コスメ・香水・美容</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Button
								type="submit"
								className="w-full"
								disabled={createProductMutation.isPending}
							>
								{createProductMutation ? "出品中..." : "出品する"}
							</Button>
						</form>
					</CardContent>
				</Card>
			</main>
		</div>
	);
}
