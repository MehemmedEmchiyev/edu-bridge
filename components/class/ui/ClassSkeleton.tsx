import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// const 

const ClassSkeleton = () => {
    let array = Array.from({ length: 8 })
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {array.map((_, i) => <Card
                key={i}
                className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer"
            >
                <CardContent className="flex flex-col gap-4 px-6">
                    <div className="flex items-start justify-between gap-3">
                        <h3
                            className="font-semibold text-lg text-foreground hover:text-primary transition-colors flex-1"
                        >
                            <Skeleton className="h-4 w-[250px]" />
                        </h3>

                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {["", "", ""]?.map((_, index: number) => (
                            <Skeleton key={index} className="h-4 w-[25px]" />
                        ))}
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground ml-1 font-medium">
                            <Skeleton className="h-4 w-full" />
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-1">
                        <span className="flex w-full items-center gap-1.5 text-xs text-muted-foreground font-medium">
                            <Skeleton className="h-4 w-full" />
                        </span>
                    </div>
                </CardContent>
            </Card>)}
        </div>
    )
}

export default ClassSkeleton