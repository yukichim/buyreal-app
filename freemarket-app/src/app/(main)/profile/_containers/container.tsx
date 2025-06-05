import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Star } from "lucide-react";

export default function ProfileContainer() {
	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
						<a href="/" className="text-gray-600 hover:text-gray-900">
							ホームに戻る
						</a>
					</div>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid gap-8 md:grid-cols-3">
					<div className="md:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle>プロフィール</CardTitle>
							</CardHeader>
							<CardContent className="text-center">
								<Avatar className="w-24 h-24 mx-auto mb-4">
									<AvatarImage src="/placeholder-user.jpg" />
									<AvatarFallback>ユーザー</AvatarFallback>
								</Avatar>
								<h2 className="text-xl font-semibold mb-2">田中太郎</h2>
								<div className="flex items-center justify-center gap-1 mb-2">
									<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
									<span className="font-medium">4.8</span>
									<span className="text-gray-500">(24件)</span>
								</div>
								<Badge variant="secondary">認証済み</Badge>
							</CardContent>
						</Card>
					</div>

					<div className="md:col-span-2">
						<div className="grid gap-6">
							<Card>
								<CardHeader>
									<CardTitle>出品中の商品</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-500">現在出品中の商品はありません</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>購入履歴</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-500">購入履歴はありません</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>売上履歴</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-gray-500">売上履歴はありません</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
