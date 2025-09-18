"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Grid3X3, Copy } from "lucide-react"
import { useState } from "react"

const paginationExamples = [
  {
    name: "Basic Pagination",
    description: "Simple numbered pagination with previous/next",
    code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  },
  {
    name: "Advanced Pagination",
    description: "Pagination with ellipsis and jump to first/last",
    code: `<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationFirst href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>5</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLast href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>`,
  },
]

export function PaginationHelpers() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalItems, setTotalItems] = useState(250)

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const generatePageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pagination Helpers</h1>
          <p className="text-muted-foreground">Utilities and components for handling data pagination</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            <Grid3X3 className="w-3 h-3 mr-1" />
            {paginationExamples.length} Examples
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Interactive Demo */}
        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Interactive Demo</CardTitle>
              <CardDescription className="text-muted-foreground">
                Configure pagination settings and see live preview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Total Items</Label>
                  <Input
                    type="number"
                    value={totalItems}
                    onChange={(e) => setTotalItems(Number(e.target.value))}
                    className="bg-input border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Items per Page</Label>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Showing {startItem}-{endItem} of {totalItems} items
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                {/* Live Pagination Component */}
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {generatePageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => typeof page === "number" && setCurrentPage(page)}
                      disabled={page === "..."}
                      className={
                        page === currentPage
                          ? "bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:bg-accent bg-transparent"
                      }
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="border-border text-foreground hover:bg-accent bg-transparent"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Pagination Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Page:</span>
                  <div className="font-medium text-foreground">{currentPage}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Pages:</span>
                  <div className="font-medium text-foreground">{totalPages}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Items per Page:</span>
                  <div className="font-medium text-foreground">{itemsPerPage}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Items:</span>
                  <div className="font-medium text-foreground">{totalItems}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Examples */}
        <div className="space-y-4">
          {paginationExamples.map((example, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">{example.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{example.description}</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto text-muted-foreground">
                    <code>{example.code}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Utility Functions</CardTitle>
              <CardDescription className="text-muted-foreground">Helper functions for pagination logic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">calculatePagination</h4>
                  <pre className="text-xs bg-muted p-3 rounded text-muted-foreground">
                    <code>{`function calculatePagination(currentPage, totalItems, itemsPerPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return { totalPages, startItem, endItem };
}`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-foreground mb-2">generatePageNumbers</h4>
                  <pre className="text-xs bg-muted p-3 rounded text-muted-foreground">
                    <code>{`function generatePageNumbers(currentPage, totalPages, maxVisible = 5) {
  const pages = [];
  
  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Complex logic for ellipsis handling
    // ... implementation details
  }
  
  return pages;
}`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
