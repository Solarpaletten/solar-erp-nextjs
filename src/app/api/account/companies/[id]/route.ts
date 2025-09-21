import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Обновление компании
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Promise!
) {
  try {
    const { id } = await params  // await!
    const companyId = parseInt(id)

    const { name, code, description } = await request.json()
    
    console.log('Updating company:', companyId, { name, code, description })

    const updatedCompany = await prisma.companies.update({
      where: { id: companyId },
      data: {
        name,
        code,
        description,
        updated_at: new Date()
      }
    })

    console.log('Company updated successfully:', updatedCompany)

    return NextResponse.json({
      success: true,
      company: updatedCompany
    })

  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update company' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// DELETE - Удаление компании
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const companyId = parseInt(id)

    // ДОБАВЬТЕ ЭТИ СТРОКИ:
    await prisma.companies.delete({
      where: { id: companyId }
    })
    
    console.log('Company deleted successfully')

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete company' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET - Получение одной компании (опционально)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const companyId = parseInt(id)

    const company = await prisma.companies.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json({ 
        success: false,
        error: 'Company not found' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      company
    })

  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch company' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}