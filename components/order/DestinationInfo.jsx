import React from "react"
import { ExternalLink } from "lucide-react"
import { useTranslation } from "next-i18next"

export default function DestinationInfo({ modalTiles = [], onOpen }) {
  const { t } = useTranslation("order");
  return (
    <div className="rounded-[20px] bg-surface p-4 md:p-6 shadow-sm border border-border">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{t("destination_guide")}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {modalTiles.map((tile) => {
          const Icon = tile.icon
          return (
            <button
              key={tile.title}
              onClick={() => onOpen(tile)}
              className="group flex min-h-[56px] items-center justify-between rounded-2xl border border-border bg-muted/30 p-3 text-left transition-all hover:border-primary/40 hover:bg-surface hover:shadow-sm active:scale-[0.98]"
            >
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-2 mb-0.5">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <h3 className="font-bold text-[12px] md:text-[13px] text-foreground truncate">{tile.title}</h3>
                </div> {/* No static text here */}
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight">{t("tap_to_explore")}</p>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
