import type React from "react";
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
import { Button } from "~/components/ui/button";

import { ProductCondition } from "~/server/domain/entities/product";

interface SellProductFormProps {
	formData: {
		title: string;
		description: string;
		price: string;
		condition: string;
		categoryId: string;
	};
	onFormChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
		name?: string,
	) => void;
	onSubmit: (e: React.FormEvent) => void;
	productConditions: ProductCondition[]; // 利用可能な商品状態を渡す
}

/**
 * @description 値・ロジックを持たず、UIを純粋にレンダリングする責務のみ持つ
 * @param param0
 * @returns
 */
export default function SellProductPresenter({
	formData,
	onFormChange,
	onSubmit,
	productConditions,
}: SellProductFormProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>商品情報を入力</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-6">
					<div>
						<Label htmlFor="title">商品名</Label>
						<Input
							id="title"
							name="title"
							value={formData.title}
							onChange={onFormChange}
							required
						/>
					</div>

					<div>
						<Label htmlFor="description">商品説明</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={onFormChange}
							rows={4}
							required
						/>
					</div>

					<div>
						<Label htmlFor="price">価格（円）</Label>
						<Input
							id="price"
							name="price"
							type="number"
							value={formData.price}
							onChange={onFormChange}
							required
						/>
					</div>

					<div>
						<Label htmlFor="condition">商品の状態</Label>
						<Select
							value={formData.condition}
							onValueChange={(value) => onFormChange(value, "condition")} // nameを渡す
						>
							<SelectTrigger>
								<SelectValue placeholder="状態を選択" />
							</SelectTrigger>
							<SelectContent>
								{productConditions.map((condition) => (
									<SelectItem key={condition} value={condition}>
										{/* ここでProductConditionの値を表示用の文字列に変換するロジックが必要な場合があります */}
										{condition === ProductCondition.NEW && "新品"}
										{condition === ProductCondition.LIKE_NEW && "未使用に近い"}
										{condition === ProductCondition.GOOD &&
											"目立った傷や汚れなし"}
										{condition === ProductCondition.FAIR && "やや傷や汚れあり"}
										{condition === ProductCondition.POOR && "傷や汚れあり"}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<Label htmlFor="category">カテゴリー</Label>
						<Select
							value={formData.categoryId}
							onValueChange={(value) => onFormChange(value, "categoryId")} // nameを渡す
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

					<Button type="submit" className="w-full">
						出品する
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
