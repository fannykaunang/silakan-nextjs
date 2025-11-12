import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number | null;
  maxRating?: number;
}

export function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  // Jika rating tidak ada atau 0, tampilkan pesan
  if (rating === null || rating === undefined || rating === 0) {
    return <span className="text-gray-400 text-xs">Belum dinilai</span>;
  }

  // Hitung jumlah bintang penuh
  const fullStars = Math.floor(rating);
  // Periksa apakah ada bintang setengah
  const hasHalfStar = rating % 1 !== 0;
  // Hitung jumlah bintang kosong
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {/* Render bintang penuh */}
      {Array.from({ length: fullStars }).map((_, index) => (
        <Star
          key={`full-${index}`}
          className="w-4 h-4 text-yellow-400 fill-yellow-400"
        />
      ))}

      {/* Render bintang setengah */}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          {/* Bintang kosong sebagai latar belakang */}
          <Star className="absolute top-0 left-0 w-4 h-4 text-gray-300 dark:text-gray-600 fill-current" />
          {/* Bintang terisi yang dipotong setengahnya */}
          <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      )}

      {/* Render bintang kosong */}
      {Array.from({ length: emptyStars }).map((_, index) => (
        <Star
          key={`empty-${index}`}
          className="w-4 h-4 text-gray-300 dark:text-gray-600 fill-current"
        />
      ))}
    </div>
  );
}
