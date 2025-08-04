"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Copy, Eye, EyeOff, HelpCircle, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSpecial: boolean
}

interface FormData {
  url: string
  masterPassword: string
  secretKey: string
  username: string
  options: PasswordOptions
}

export default function PasswordGenerator() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    url: "",
    masterPassword: "",
    secretKey: "",
    username: "",
    options: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecial: true,
    },
  })

  const [generatedPassword, setGeneratedPassword] = useState("")
  const [showMasterPassword, setShowMasterPassword] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "moderate" | "strong">("weak")
  const [normalizedUrl, setNormalizedUrl] = useState("")
  const [clearTimer, setClearTimer] = useState<NodeJS.Timeout | null>(null)

  // Normalize URL to root domain
  const normalizeUrl = useCallback((url: string): string => {
    if (!url) return ""

    try {
      // Remove protocol and www
      let normalized = url
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .split("?")[0]
        .split("#")[0]

      // Extract root domain (simple approach)
      const parts = normalized.split(".")
      if (parts.length > 2) {
        // Keep last two parts for most domains (e.g., example.com)
        normalized = parts.slice(-2).join(".")
      }

      return normalized
    } catch {
      return url.toLowerCase()
    }
  }, [])

  // Update normalized URL when URL changes
  useEffect(() => {
    setNormalizedUrl(normalizeUrl(formData.url))
  }, [formData.url, normalizeUrl])

  // Validate inputs
  const validateInputs = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.url.trim()) {
      newErrors.url = "Website URL is required"
    }

    if (!formData.masterPassword) {
      newErrors.masterPassword = "Master password is required"
    } else if (formData.masterPassword.length < 8) {
      newErrors.masterPassword = "Master password should be at least 8 characters"
    }

    if (!formData.secretKey.trim()) {
      newErrors.secretKey = "Secret key is required"
    }

    const { includeUppercase, includeLowercase, includeNumbers, includeSpecial } = formData.options
    if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSpecial) {
      newErrors.options = "At least one character type must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Generate password using PBKDF2
  const generatePassword = useCallback(async (): Promise<string> => {
    const { url, masterPassword, secretKey, username, options } = formData
    const normalizedDomain = normalizeUrl(url)

    // Concatenate inputs
    const input = masterPassword + normalizedDomain + secretKey + (username || "")

    try {
      // Use Web Crypto API for PBKDF2
      const encoder = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(input), { name: "PBKDF2" }, false, [
        "deriveBits",
      ])

      const salt = encoder.encode(normalizedDomain || "DeterministicPasswordGenSalt")
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        256, // 32 bytes
      )

      // Convert to base64 and then to password
      const hashArray = new Uint8Array(derivedBits)
      const base64 = btoa(String.fromCharCode(...hashArray))

      return derivePasswordFromHash(base64, options)
    } catch (error) {
      console.error("Password generation failed:", error)
      throw new Error("Failed to generate password")
    }
  }, [formData, normalizeUrl])

  // Derive password from hash with character set requirements
  const derivePasswordFromHash = (hash: string, options: PasswordOptions): string => {
    const { length, includeUppercase, includeLowercase, includeNumbers, includeSpecial } = options

    let charset = ""
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) charset += "0123456789"
    if (includeSpecial) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (!charset) return ""

    // Generate base password
    let password = ""
    for (let i = 0; i < length; i++) {
      const charIndex = hash.charCodeAt(i % hash.length) % charset.length
      password += charset[charIndex]
    }

    // Ensure at least one character from each required set
    const requiredSets = []
    if (includeUppercase) requiredSets.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    if (includeLowercase) requiredSets.push("abcdefghijklmnopqrstuvwxyz")
    if (includeNumbers) requiredSets.push("0123456789")
    if (includeSpecial) requiredSets.push("!@#$%^&*")

    // Replace first characters to ensure requirements are met
    requiredSets.forEach((set, index) => {
      if (index < password.length) {
        const charIndex = hash.charCodeAt(index) % set.length
        password = password.substring(0, index) + set[charIndex] + password.substring(index + 1)
      }
    })

    return password
  }

  // Calculate password strength
  const calculateStrength = (password: string): "weak" | "moderate" | "strong" => {
    if (password.length < 8) return "weak"

    let score = 0
    if (/[a-z]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^a-zA-Z0-9]/.test(password)) score++

    if (password.length >= 12 && score >= 3) return "strong"
    if (password.length >= 8 && score >= 2) return "moderate"
    return "weak"
  }

  // Handle password generation
  const handleGeneratePassword = async () => {
    if (!validateInputs()) return

    try {
      const password = await generatePassword()
      setGeneratedPassword(password)
      setPasswordStrength(calculateStrength(password))

      // Clear password after 30 seconds
      if (clearTimer) clearTimeout(clearTimer)
      const timer = setTimeout(() => {
        setGeneratedPassword("")
        toast({
          title: "Password cleared",
          description: "Generated password has been cleared for security.",
        })
      }, 30000)
      setClearTimer(timer)
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate password. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Copy to clipboard
  const copyToClipboard = async () => {
    if (!generatedPassword) return

    try {
      await navigator.clipboard.writeText(generatedPassword)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
      })
    } catch {
      toast({
        title: "Copy failed",
        description: "Failed to copy password to clipboard.",
        variant: "destructive",
      })
    }
  }

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (clearTimer) clearTimeout(clearTimer)
    }
  }, [clearTimer])

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "weak":
        return "text-red-500"
      case "moderate":
        return "text-yellow-500"
      case "strong":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case "weak":
        return <AlertTriangle className="w-4 h-4" />
      case "moderate":
        return <Shield className="w-4 h-4" />
      case "strong":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Deterministic Password Generator
              </CardTitle>
              <CardDescription>
                Generate secure, consistent passwords for your websites without storing them anywhere.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Website URL */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter the website URL. It will be normalized to the root domain.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  className={errors.url ? "border-red-500" : ""}
                />
                {normalizedUrl && <p className="text-sm text-gray-600">Normalized: {normalizedUrl}</p>}
                {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
              </div>

              {/* Master Password */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="masterPassword">Master Password</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your main password. Use a strong, unique password that you can remember.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="masterPassword"
                    type={showMasterPassword ? "text" : "password"}
                    placeholder="Enter your master password"
                    value={formData.masterPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, masterPassword: e.target.value }))}
                    className={errors.masterPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowMasterPassword(!showMasterPassword)}
                  >
                    {showMasterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.masterPassword && <p className="text-sm text-red-500">{errors.masterPassword}</p>}
              </div>

              {/* Secret Key */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="secretKey">Secret Key</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>A unique secret that adds extra security. Keep this safe and consistent.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <Input
                    id="secretKey"
                    type={showSecretKey ? "text" : "password"}
                    placeholder="Enter your secret key"
                    value={formData.secretKey}
                    onChange={(e) => setFormData((prev) => ({ ...prev, secretKey: e.target.value }))}
                    className={errors.secretKey ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {errors.secretKey && <p className="text-sm text-red-500">{errors.secretKey}</p>}
              </div>

              {/* Username (Optional) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Optional username or email for the website. Helps generate unique passwords for multiple
                        accounts.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="username"
                  placeholder="username@example.com"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>

              {/* Password Options */}
              <div className="space-y-4">
                <Label>Password Options</Label>

                {/* Length */}
                <div className="flex items-center gap-4">
                  <Label htmlFor="length" className="min-w-0 flex-shrink-0">
                    Length:
                  </Label>
                  <Select
                    value={formData.options.length.toString()}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        options: { ...prev.options, length: Number.parseInt(value) },
                      }))
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 25 }, (_, i) => i + 8).map((length) => (
                        <SelectItem key={length} value={length.toString()}>
                          {length}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Character Sets */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={formData.options.includeUppercase}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          options: { ...prev.options, includeUppercase: !!checked },
                        }))
                      }
                    />
                    <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={formData.options.includeLowercase}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          options: { ...prev.options, includeLowercase: !!checked },
                        }))
                      }
                    />
                    <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={formData.options.includeNumbers}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          options: { ...prev.options, includeNumbers: !!checked },
                        }))
                      }
                    />
                    <Label htmlFor="numbers">Numbers (0-9)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="special"
                      checked={formData.options.includeSpecial}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          options: { ...prev.options, includeSpecial: !!checked },
                        }))
                      }
                    />
                    <Label htmlFor="special">Special (!@#$...)</Label>
                  </div>
                </div>
                {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
              </div>

              {/* Generate Button */}
              <Button onClick={handleGeneratePassword} className="w-full" size="lg">
                Generate Password
              </Button>

              {/* Generated Password */}
              {generatedPassword && (
                <div className="space-y-3">
                  <Label>Generated Password</Label>
                  <div className="flex gap-2">
                    <Input value={generatedPassword} readOnly className="font-mono" />
                    <Button onClick={copyToClipboard} variant="outline" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${getStrengthColor(passwordStrength)}`}>
                    {getStrengthIcon(passwordStrength)}
                    <span>Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</span>
                  </div>
                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      Password will be cleared automatically in 30 seconds for security.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Security Notice */}
              <Alert>
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> This application runs entirely in your browser. No passwords or data
                  are stored anywhere. The same inputs will always generate the same password.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
